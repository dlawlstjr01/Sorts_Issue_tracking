import os
import time
import random
import threading
from datetime import datetime
from contextlib import asynccontextmanager

import requests
import pymysql
from fastapi import FastAPI

# -----------------------------
# Config
# -----------------------------
DB_HOST = os.getenv("DB_HOST", "project-db-cgi.smhrd.com")
DB_PORT = int(os.getenv("DB_PORT", "3307"))
DB_USER = os.getenv("DB_USER", "cgi_25K_DA1_p3_3")
DB_PASSWORD = os.getenv("DB_PASSWORD", "smhrd3")
DB_NAME = os.getenv("DB_NAME", "cgi_25K_DA1_p3_3")

CRAWL_INTERVAL_SEC = int(os.getenv("CRAWL_INTERVAL_SEC", "900"))  # 15분

# 소스 URL
CRAWL_SOURCE_URL = os.getenv("CRAWL_SOURCE_URL", "")

# 크롤러 동시 폭주 방지(컨테이너 여러개 떠도 1개만 실행되게)
DB_LOCK_NAME = os.getenv("DB_LOCK_NAME", "news_project_crawler_lock")

# 최소 호출 간격(안전장치)
GDELT_MIN_INTERVAL_SEC = int(os.getenv("GDELT_MIN_INTERVAL_SEC", "120"))  # 기존 60 -> 120 권장

# -----------------------------
# Runtime state
# -----------------------------
last_items = []  # Node가 /crawl로 가져갈 캐시

_last_call_ts = 0.0
_backoff_until = 0.0
_fail_count = 0

# 조건부 요청 캐시
_last_etag = None
_last_modified = None

# 세션 재사용
_session = requests.Session()
_session.headers.update({
    "User-Agent": "news_project_crawler/1.0",
    "Accept": "application/json, text/plain, */*",
})


def get_conn():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset="utf8mb4",
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor,
    )


def parse_dt(raw_dt):
    if not raw_dt:
        return None
    s = str(raw_dt).strip()
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def sleep_full_jitter(max_sec: float):
    """
    Full jitter: [0, max_sec] 랜덤으로 잠.
    여러 컨테이너/스레드가 동시에 재시도하는 동시폭주를 줄여줌.
    """
    time.sleep(max(0.0, random.uniform(0.0, float(max_sec))))


def acquire_db_lock() -> bool:
    """
    MySQL GET_LOCK으로 분산락 획득.
    동시에 여러 컨테이너 떠도 실제 크롤링은 1개만 하게 됨.
    """
    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT GET_LOCK(%s, 0) AS got", (DB_LOCK_NAME,))
            row = cur.fetchone()
            return bool(row and row.get("got") == 1)
    except Exception as e:
        print("[crawler] db lock error:", repr(e), flush=True)
        # 락 못 잡아도 안전하게 "실행 안 함" 쪽으로
        return False
    finally:
        if conn:
            conn.close()


def release_db_lock():
    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT RELEASE_LOCK(%s) AS rel", (DB_LOCK_NAME,))
    except Exception as e:
        print("[crawler] db unlock error:", repr(e), flush=True)
    finally:
        if conn:
            conn.close()


def calc_backoff_seconds(fail_count: int, base: int, cap: int) -> int:
    """
    지수 백오프 기본값 계산(초).
    fail_count: 1,2,3...
    """
    # 1->base, 2->base*2, 3->base*4 ...
    sec = base * (2 ** min(fail_count - 1, 6))
    return int(min(sec, cap))


def fetch_news_items():
    """
    절대 예외를 밖으로 던지지 않게.
    429/네트워크 오류는 backoff를 걸고 빈 리스트 반환.
    """
    global _last_call_ts, _backoff_until, _fail_count, _last_etag, _last_modified

    if not CRAWL_SOURCE_URL:
        print("[crawler] CRAWL_SOURCE_URL is empty. skip.", flush=True)
        return []

    now = time.time()

    # 1) 백오프 중이면 호출 자체를 스킵
    if now < _backoff_until:
        wait = _backoff_until - now
        print(f"[crawler] backoff active. wait {wait:.1f}s", flush=True)
        sleep_full_jitter(wait)
        return []

    # 2) 최소 호출 간격 유지
    since = now - _last_call_ts
    if since < GDELT_MIN_INTERVAL_SEC:
        sleep_full_jitter(GDELT_MIN_INTERVAL_SEC - since)

    # 3) 조건부 요청 헤더(ETag/Last-Modified)
    headers = {}
    if _last_etag:
        headers["If-None-Match"] = _last_etag
    if _last_modified:
        headers["If-Modified-Since"] = _last_modified

    # 4) 요청
    try:
        r = _session.get(CRAWL_SOURCE_URL, headers=headers, timeout=(15, 60))
        _last_call_ts = time.time()
    except requests.RequestException as e:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)  # 최대 30분
        _backoff_until = time.time() + backoff
        print("[crawler] request error:", repr(e), f"-> backoff {backoff}s", flush=True)
        return []

    # 5) 304 Not Modified: 변경 없으면 끝(실패 아님)
    if r.status_code == 304:
        _fail_count = 0
        _backoff_until = 0.0
        print("[crawler] 304 Not Modified (no new data)", flush=True)
        return []

    # 6) 429 처리: Retry-After 우선 + 지수 백오프
    if r.status_code == 429:
        _fail_count += 1
        ra = r.headers.get("Retry-After")

        if ra:
            try:
                backoff = int(float(str(ra).strip()))
            except Exception:
                backoff = calc_backoff_seconds(_fail_count, base=300, cap=1800)
        else:
            backoff = calc_backoff_seconds(_fail_count, base=300, cap=1800)

        # 백오프 설정 + 추가로 Full jitter(동시 재시도 분산)
        _backoff_until = time.time() + backoff
        print(f"[crawler] 429 Too Many Requests -> backoff {backoff}s (Retry-After={ra})", flush=True)
        return []

    # 7) 기타 HTTP 에러도 죽지 않게
    if r.status_code >= 400:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)
        _backoff_until = time.time() + backoff
        print(f"[crawler] http error status={r.status_code} -> backoff {backoff}s", flush=True)
        return []

    # 8) 성공이면 조건부 캐시 업데이트(서버가 제공할 때만)
    etag = r.headers.get("ETag")
    lm = r.headers.get("Last-Modified")
    if etag:
        _last_etag = etag
    if lm:
        _last_modified = lm

    # 9) JSON 파싱도 안전하게
    try:
        data = r.json()
    except Exception as e:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)
        _backoff_until = time.time() + backoff
        print("[crawler] json parse error:", repr(e), f"-> backoff {backoff}s", flush=True)
        return []

    # 성공이면 백오프 초기화
    _fail_count = 0
    _backoff_until = 0.0

    return data.get("articles") or data.get("items") or []


def upsert_articles(items):
    global last_items
    if not items:
        return 0

    sql = """
    INSERT INTO articles (url, title, thumbnail, content, published_at, category, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, NOW())
    ON DUPLICATE KEY UPDATE
      title=VALUES(title),
      thumbnail=VALUES(thumbnail),
      content=VALUES(content),
      published_at=VALUES(published_at),
      category=VALUES(category)
    """

    cnt = 0
    node_items = []

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            for it in items:
                url = it.get("url") or it.get("link")
                if not url:
                    continue

                title = it.get("title", "")
                thumb = it.get("thumbnail") or it.get("image")
                content = it.get("content") or it.get("summary")
                raw_dt = it.get("published_at") or it.get("published")
                pub_dt = parse_dt(raw_dt)
                category = it.get("category")

                cur.execute(sql, (url, title, thumb, content, pub_dt, category))

                node_items.append({
                    "url": url,
                    "title": title,
                    "thumbnail": thumb,
                    "content": content,
                    "category": category,
                    "published_at": raw_dt,
                })
                cnt += 1

    except Exception as e:
        print("[crawler] db error:", repr(e), flush=True)
        return 0
    finally:
        if conn:
            conn.close()

    last_items = node_items
    return cnt


def run_once():
    #  분산락: 여러 컨테이너 떠도 1개만 크롤링
    got = acquire_db_lock()
    if not got:
        print("[crawler] another instance holds DB lock. skip.", flush=True)
        return

    try:
        items = fetch_news_items()
        saved = upsert_articles(items)
        print(f"[crawler] fetched={len(items)} saved={saved}", flush=True)
    finally:
        release_db_lock()


def crawler_loop():
    #  초기 랜덤 딜레이: 컨테이너 동시 기동 시 폭주 방지
    initial_delay = random.uniform(10, 60)
    print(f"[crawler] initial delay {initial_delay:.1f}s", flush=True)
    time.sleep(initial_delay)

    while True:
        try:
            run_once()
        except Exception as e:
            print("[crawler] loop error:", repr(e), flush=True)

        #  주기에도 약간 지터를 줘서 여러 인스턴스가 같은 시각에 치지 않게
        base = CRAWL_INTERVAL_SEC
        jitter = random.uniform(0, min(30, base * 0.05))  # 최대 30초 또는 5%
        time.sleep(base + jitter)


@asynccontextmanager
async def lifespan(app: FastAPI):
    #  startup에서 run_once() 즉시 호출을 빼고,
    #    백그라운드 루프가 initial delay 후 알아서 실행하게 함.
    threading.Thread(target=crawler_loop, daemon=True).start()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/crawl")
def get_items():
    return {"items": last_items}