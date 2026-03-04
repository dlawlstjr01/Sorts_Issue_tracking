import os
import time
import random
import threading
import re
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from email.utils import parsedate_to_datetime

import requests
import pymysql
import feedparser
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
CRAWL_SOURCE_URL = os.getenv("CRAWL_SOURCE_URL", "")

DB_LOCK_NAME = os.getenv("DB_LOCK_NAME", "news_project_crawler_lock")
GDELT_MIN_INTERVAL_SEC = int(os.getenv("GDELT_MIN_INTERVAL_SEC", "120"))

# ✅ url 컬럼이 VARCHAR(500)이면 500으로 제한 (길면 스킵)
MAX_URL_LEN = int(os.getenv("MAX_URL_LEN", "500"))

# -----------------------------
# Runtime state
# -----------------------------
last_items = []  # Node가 /crawl로 가져갈 캐시

_last_call_ts = 0.0
_backoff_until = 0.0
_fail_count = 0

_last_etag = None
_last_modified = None

_session = requests.Session()
_session.headers.update({
    "User-Agent": "news_project_crawler/1.0",
    "Accept": "application/json, application/xml, text/xml, text/plain, */*",
})

# ✅ 중복 실행 방지(/run 연타 방지 + loop 중복 방지)
_is_running = False


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


def normalize_url(u: str) -> str:
    if not u:
        return ""
    return str(u).strip()


def parse_dt(raw_dt):
    """
    DB의 published_at(DATETIME)으로 넣을 datetime 변환.
    - ISO8601: 2026-03-04T00:39:40Z 형태
    - RSS RFC822: Wed, 04 Mar 2026 00:39:40 GMT 형태
    """
    if not raw_dt:
        return None

    s = str(raw_dt).strip()

    # ISO8601 우선
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        pass

    # RFC822 (RSS)
    try:
        dt = parsedate_to_datetime(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def sleep_full_jitter(max_sec: float):
    time.sleep(max(0.0, random.uniform(0.0, float(max_sec))))


def acquire_db_lock() -> bool:
    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT GET_LOCK(%s, 0) AS got", (DB_LOCK_NAME,))
            row = cur.fetchone()
            return bool(row and row.get("got") == 1)
    except Exception as e:
        print("[crawler] db lock error:", repr(e), flush=True)
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
    sec = base * (2 ** min(fail_count - 1, 6))
    return int(min(sec, cap))


def _rss_to_items(xml_text: str):
    """
    Google News RSS(XML) -> 공통 items 리스트로 변환
    """
    feed = feedparser.parse(xml_text)
    items = []

    for e in getattr(feed, "entries", []) or []:
        url = e.get("link")
        title = e.get("title", "") or ""

        content = e.get("summary") or e.get("description") or None
        published = e.get("published") or e.get("updated") or None

        thumb = None
        media_thumb = e.get("media_thumbnail")
        if isinstance(media_thumb, list) and media_thumb:
            thumb = media_thumb[0].get("url")

        if not thumb:
            media_content = e.get("media_content")
            if isinstance(media_content, list) and media_content:
                thumb = media_content[0].get("url")

        # ✅ summary 안에 img가 있는 경우가 있어서 보강
        if not thumb and content:
            m = re.search(r'<img[^>]+src="([^"]+)"', str(content))
            if m:
                thumb = m.group(1)

        items.append({
            "url": url,
            "title": title,
            "thumbnail": thumb,
            "content": content,
            "published_at": published,
            "category": None,  # ✅ 그대로 None
        })

    return items


def fetch_news_items():
    global _last_call_ts, _backoff_until, _fail_count, _last_etag, _last_modified

    if not CRAWL_SOURCE_URL:
        print("[crawler] CRAWL_SOURCE_URL is empty. skip.", flush=True)
        return []

    now = time.time()

    if now < _backoff_until:
        wait = _backoff_until - now
        print(f"[crawler] backoff active. wait {wait:.1f}s", flush=True)
        sleep_full_jitter(wait)
        return []

    since = now - _last_call_ts
    if since < GDELT_MIN_INTERVAL_SEC:
        sleep_full_jitter(GDELT_MIN_INTERVAL_SEC - since)

    headers = {}
    if _last_etag:
        headers["If-None-Match"] = _last_etag
    if _last_modified:
        headers["If-Modified-Since"] = _last_modified

    headers.setdefault("User-Agent", "news_project_crawler/1.0 (+https://localhost)")

    try:
        r = _session.get(
            CRAWL_SOURCE_URL,
            headers=headers,
            timeout=(10, 120),
            allow_redirects=True,
        )
        _last_call_ts = time.time()
    except requests.RequestException as e:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=10, cap=1800)
        _backoff_until = time.time() + backoff
        print("[crawler] request error:", repr(e), f"-> backoff {backoff}s", flush=True)
        return []

    if r.status_code == 304:
        _fail_count = 0
        _backoff_until = 0.0
        print("[crawler] 304 Not Modified (no new data)", flush=True)
        return []

    if r.status_code == 429:
        _fail_count += 1
        ra = r.headers.get("Retry-After")
        if ra:
            try:
                backoff = int(float(str(ra).strip()))
            except Exception:
                backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)
        else:
            backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)

        _backoff_until = time.time() + backoff
        print(f"[crawler] 429 Too Many Requests -> backoff {backoff}s (Retry-After={ra})", flush=True)
        return []

    if r.status_code >= 400:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=10, cap=1800)
        _backoff_until = time.time() + backoff
        print(f"[crawler] http error status={r.status_code} -> backoff {backoff}s", flush=True)
        return []

    etag = r.headers.get("ETag")
    lm = r.headers.get("Last-Modified")
    if etag:
        _last_etag = etag
    if lm:
        _last_modified = lm

    items = []
    try:
        data = r.json()
        items = data.get("articles") or data.get("items") or []
    except Exception:
        items = _rss_to_items(r.text)

    _fail_count = 0
    _backoff_until = 0.0
    return items


from typing import List, Dict

def chunked(lst, n: int):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def upsert_articles(items: List[Dict]):
    global last_items

    if not items:
        last_items = []
        return 0

    # 1) 1차 정리: url 정규화 + 길이 제한 + (이번 배치 안) 중복 제거
    cleaned = []
    seen_in_batch = set()

    for it in items:
        url = normalize_url(it.get("url") or it.get("link"))
        if not url:
            continue
        if len(url) > MAX_URL_LEN:
            continue

        # 이번 배치 내부 중복 제거
        if url in seen_in_batch:
            continue
        seen_in_batch.add(url)

        title = (it.get("title", "") or "").strip()
        thumb = it.get("thumbnail") or it.get("image") or None
        content = it.get("content") or it.get("summary") or None
        raw_dt = it.get("published_at") or it.get("published")
        pub_dt = parse_dt(raw_dt)

        cleaned.append({
            "url": url,
            "title": title,
            "thumbnail": thumb,
            "content": content,
            "pub_dt": pub_dt,
            "raw_dt": raw_dt,   # 노드로 내려줄 때 원문 유지용
        })

    if not cleaned:
        last_items = []
        return 0

    urls = [c["url"] for c in cleaned]

    # 2) DB에 이미 존재하는 url을 "한 번에" 조회해서 제외
    existing = set()
    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            # IN 절 너무 길어지면 쪼개기 (500~1000 정도가 안정적)
            for part in chunked(urls, 500):
                placeholders = ",".join(["%s"] * len(part))
                cur.execute(
                    f"SELECT url FROM articles WHERE url IN ({placeholders})",
                    tuple(part),
                )
                for row in cur.fetchall():
                    existing.add(row["url"])

            # 3) 남은 것만 INSERT (빠르게 executemany)
            to_insert = [c for c in cleaned if c["url"] not in existing]

            sql = """
            INSERT INTO articles (url, title, thumbnail, content, published_at, category, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """

            params = []
            node_items = []
            for c in to_insert:
                category = "기타"  # ✅ 항상 기타
                params.append((
                    c["url"],
                    c["title"],
                    c["thumbnail"],
                    c["content"],
                    c["pub_dt"],
                    category,
                ))
                node_items.append({
                    "url": c["url"],
                    "title": c["title"],
                    "thumbnail": c["thumbnail"],
                    "content": c["content"],
                    "category": category,
                    "published_at": c["raw_dt"],
                })

            saved = 0
            if params:
                cur.executemany(sql, params)
                saved = len(params)

            last_items = node_items
            print(
                f"[crawler] upsert done saved={saved} skipped_existing={len(existing)} "
                f"batch_total={len(cleaned)}",
                flush=True
            )
            return saved

    except Exception as e:
        print("[crawler] db error:", repr(e), flush=True)
        last_items = []
        return 0

    finally:
        if conn:
            conn.close()


def run_once():
    global _is_running
    if _is_running:
        print("[crawler] run_once already running. skip.", flush=True)
        return

    _is_running = True
    print("[crawler] run_once start", flush=True)

    got = acquire_db_lock()
    print(f"[crawler] db lock got={got}", flush=True)
    if not got:
        _is_running = False
        print("[crawler] another instance holds DB lock. skip.", flush=True)
        return

    try:
        print("[crawler] fetching...", flush=True)
        items = fetch_news_items()
        print(f"[crawler] fetched items={len(items)}", flush=True)

        print("[crawler] upserting...", flush=True)
        saved = upsert_articles(items)
        print(f"[crawler] saved={saved}", flush=True)
    except Exception as e:
        print("[crawler] run_once error:", repr(e), flush=True)
    finally:
        release_db_lock()
        print("[crawler] db lock released", flush=True)
        _is_running = False


def crawler_loop():
    initial_delay = random.uniform(10, 60)
    print(f"[crawler] initial delay {initial_delay:.1f}s", flush=True)
    time.sleep(initial_delay)

    while True:
        try:
            run_once()
        except Exception as e:
            print("[crawler] loop error:", repr(e), flush=True)

        base = CRAWL_INTERVAL_SEC
        jitter = random.uniform(0, min(30, base * 0.05))
        time.sleep(base + jitter)


@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=crawler_loop, daemon=True).start()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/crawl")
def get_items():
    return {"items": last_items}


# ✅ 수동 트리거: 즉시 응답 + 백그라운드 실행
@app.get("/run")
def run_crawl():
    print("[crawler] /run hit -> start thread", flush=True)
    threading.Thread(target=run_once, daemon=True).start()
    return {"ok": True, "message": "crawl started"}