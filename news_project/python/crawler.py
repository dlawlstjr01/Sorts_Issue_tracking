# import os
# import time
# import random
# import threading
# import re
# from datetime import datetime, timezone
# from contextlib import asynccontextmanager
# from email.utils import parsedate_to_datetime

# import requests
# import pymysql
# import feedparser
# from fastapi import FastAPI
# from bs4 import BeautifulSoup

# # -----------------------------
# # Config
# # -----------------------------
# DB_HOST = os.getenv("DB_HOST", "project-db-cgi.smhrd.com")
# DB_PORT = int(os.getenv("DB_PORT", "3307"))
# DB_USER = os.getenv("DB_USER", "cgi_25K_DA1_p3_3")
# DB_PASSWORD = os.getenv("DB_PASSWORD", "smhrd3")
# DB_NAME = os.getenv("DB_NAME", "cgi_25K_DA1_p3_3")

# CRAWL_INTERVAL_SEC = int(os.getenv("CRAWL_INTERVAL_SEC", "900"))  # 15분
# CRAWL_SOURCE_URL = os.getenv("CRAWL_SOURCE_URL", "")

# DB_LOCK_NAME = os.getenv("DB_LOCK_NAME", "news_project_crawler_lock")
# GDELT_MIN_INTERVAL_SEC = int(os.getenv("GDELT_MIN_INTERVAL_SEC", "120"))

# MAX_URL_LEN = int(os.getenv("MAX_URL_LEN", "500"))

# # -----------------------------
# # Runtime state
# # -----------------------------
# last_items = []
# _og_cache = {}  # url -> og:image(or None)

# _last_call_ts = 0.0
# _backoff_until = 0.0
# _fail_count = 0

# _last_etag = None
# _last_modified = None

# _session = requests.Session()
# _session.headers.update({
#     "User-Agent": "news_project_crawler/1.0",
#     "Accept": "application/json, application/xml, text/xml, text/plain, */*",
# })

# _is_running = False


# def get_conn():
#     return pymysql.connect(
#         host=DB_HOST,
#         port=DB_PORT,
#         user=DB_USER,
#         password=DB_PASSWORD,
#         db=DB_NAME,
#         charset="utf8mb4",
#         autocommit=True,
#         cursorclass=pymysql.cursors.DictCursor,
#     )


# def normalize_url(u: str) -> str:
#     if not u:
#         return ""
#     return str(u).strip()


# def parse_dt(raw_dt):
#     if not raw_dt:
#         return None
#     s = str(raw_dt).strip()

#     try:
#         return datetime.fromisoformat(s.replace("Z", "+00:00"))
#     except Exception:
#         pass

#     try:
#         dt = parsedate_to_datetime(s)
#         if dt.tzinfo is None:
#             dt = dt.replace(tzinfo=timezone.utc)
#         return dt
#     except Exception:
#         return None


# def sleep_full_jitter(max_sec: float):
#     time.sleep(max(0.0, random.uniform(0.0, float(max_sec))))


# def acquire_db_lock() -> bool:
#     conn = None
#     try:
#         conn = get_conn()
#         with conn.cursor() as cur:
#             cur.execute("SELECT GET_LOCK(%s, 0) AS got", (DB_LOCK_NAME,))
#             row = cur.fetchone()
#             return bool(row and row.get("got") == 1)
#     except Exception as e:
#         print("[crawler] db lock error:", repr(e), flush=True)
#         return False
#     finally:
#         if conn:
#             conn.close()


# def release_db_lock():
#     conn = None
#     try:
#         conn = get_conn()
#         with conn.cursor() as cur:
#             cur.execute("SELECT RELEASE_LOCK(%s) AS rel", (DB_LOCK_NAME,))
#     except Exception as e:
#         print("[crawler] db unlock error:", repr(e), flush=True)
#     finally:
#         if conn:
#             conn.close()


# def calc_backoff_seconds(fail_count: int, base: int, cap: int) -> int:
#     sec = base * (2 ** min(fail_count - 1, 6))
#     return int(min(sec, cap))


# def is_google_news_link(u: str) -> bool:
#     if not u:
#         return False
#     u = u.lower()
#     return "news.google.com" in u


# def is_bad_thumb(img: str) -> bool:
#     if not img:
#         return True
#     s = img.lower()
#     # 구글 로고/기본 이미지 계열(대표적으로 gstatic/google logo)
#     if "gstatic.com" in s and ("google" in s or "logo" in s or "gnews" in s):
#         return True
#     if "google" in s and ("logo" in s or "glogo" in s):
#         return True
#     # 파비콘/아이콘류
#     if "favicon" in s or "icon" in s:
#         return True
#     return False


# def extract_origin_url_from_summary(summary_html: str) -> str | None:
#     """
#     Google News RSS summary HTML에 포함된 <a href="..."> 중
#     google이 아닌 외부 링크를 원문으로 선택
#     """
#     if not summary_html:
#         return None
#     try:
#         soup = BeautifulSoup(summary_html, "html.parser")
#         for a in soup.find_all("a", href=True):
#             href = (a.get("href") or "").strip()
#             if href.startswith("http") and not is_google_news_link(href):
#                 return href
#         return None
#     except Exception:
#         return None


# def resolve_origin_url(item: dict) -> str:
#     """
#     item에서 원문 URL을 최대한 확실히 뽑는다.
#     1) summary/content HTML 안의 외부 링크
#     2) item.url/link 그대로
#     """
#     # summary/content에서 원문 링크 우선 추출
#     html = item.get("content") or item.get("summary") or item.get("description") or ""
#     origin = extract_origin_url_from_summary(str(html))
#     if origin:
#         return origin

#     # fallback
#     return normalize_url(item.get("url") or item.get("link") or "")


# def fetch_og_image(url: str):
#     """
#     원문 URL에서 og:image / twitter:image 추출
#     """
#     if not url:
#         return None

#     if url in _og_cache:
#         return _og_cache[url]

#     try:
#         r = _session.get(
#             url,
#             timeout=(3, 7),
#             allow_redirects=True,
#             headers={"User-Agent": "Mozilla/5.0"}
#         )
#         if r.status_code >= 400:
#             _og_cache[url] = None
#             return None

#         soup = BeautifulSoup(r.text, "html.parser")

#         img = None
#         m = soup.find("meta", attrs={"property": "og:image"})
#         if m and m.get("content"):
#             img = m["content"].strip()
#         else:
#             m = soup.find("meta", attrs={"name": "twitter:image"})
#             if m and m.get("content"):
#                 img = m["content"].strip()

#         if img and is_bad_thumb(img):
#             img = None

#         _og_cache[url] = img
#         return img

#     except Exception:
#         _og_cache[url] = None
#         return None


# def _rss_to_items(xml_text: str):
#     """
#     RSS -> items
#     (중요) url은 '구글 중간링크'가 아니라 '원문 링크'로 채워서 내려준다.
#     """
#     feed = feedparser.parse(xml_text)
#     items = []

#     for e in getattr(feed, "entries", []) or []:
#         title = (e.get("title", "") or "").strip()
#         content = e.get("summary") or e.get("description") or None
#         published = e.get("published") or e.get("updated") or None

#         # 구글 링크(중간 링크)
#         g_url = normalize_url(e.get("link") or "")

#         # ✅ summary 안에서 원문 링크 추출
#         origin = extract_origin_url_from_summary(str(content) if content else "")

#         # ✅ url은 원문 링크 우선, 없으면 구글 링크
#         url = origin or g_url

#         items.append({
#             "url": url,
#             "title": title,
#             "thumbnail": None,        # RSS에서 안 주는 경우가 많아서 None
#             "content": content,
#             "published_at": published,
#             "category": None,
#         })

#     return items


# def fetch_news_items():
#     global _last_call_ts, _backoff_until, _fail_count, _last_etag, _last_modified

#     if not CRAWL_SOURCE_URL:
#         print("[crawler] CRAWL_SOURCE_URL is empty. skip.", flush=True)
#         return []

#     now = time.time()

#     if now < _backoff_until:
#         wait = _backoff_until - now
#         print(f"[crawler] backoff active. wait {wait:.1f}s", flush=True)
#         sleep_full_jitter(wait)
#         return []

#     since = now - _last_call_ts
#     if since < GDELT_MIN_INTERVAL_SEC:
#         sleep_full_jitter(GDELT_MIN_INTERVAL_SEC - since)

#     headers = {}
#     if _last_etag:
#         headers["If-None-Match"] = _last_etag
#     if _last_modified:
#         headers["If-Modified-Since"] = _last_modified
#     headers.setdefault("User-Agent", "news_project_crawler/1.0 (+https://localhost)")

#     try:
#         r = _session.get(
#             CRAWL_SOURCE_URL,
#             headers=headers,
#             timeout=(10, 120),
#             allow_redirects=True,
#         )
#         _last_call_ts = time.time()
#     except requests.RequestException as e:
#         _fail_count += 1
#         backoff = calc_backoff_seconds(_fail_count, base=10, cap=1800)
#         _backoff_until = time.time() + backoff
#         print("[crawler] request error:", repr(e), f"-> backoff {backoff}s", flush=True)
#         return []

#     if r.status_code == 304:
#         _fail_count = 0
#         _backoff_until = 0.0
#         print("[crawler] 304 Not Modified (no new data)", flush=True)
#         return []

#     if r.status_code == 429:
#         _fail_count += 1
#         ra = r.headers.get("Retry-After")
#         if ra:
#             try:
#                 backoff = int(float(str(ra).strip()))
#             except Exception:
#                 backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)
#         else:
#             backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)
#         _backoff_until = time.time() + backoff
#         print(f"[crawler] 429 Too Many Requests -> backoff {backoff}s (Retry-After={ra})", flush=True)
#         return []

#     if r.status_code >= 400:
#         _fail_count += 1
#         backoff = calc_backoff_seconds(_fail_count, base=10, cap=1800)
#         _backoff_until = time.time() + backoff
#         print(f"[crawler] http error status={r.status_code} -> backoff {backoff}s", flush=True)
#         return []

#     etag = r.headers.get("ETag")
#     lm = r.headers.get("Last-Modified")
#     if etag:
#         _last_etag = etag
#     if lm:
#         _last_modified = lm

#     # JSON이면 json, 아니면 RSS
#     try:
#         data = r.json()
#         items = data.get("articles") or data.get("items") or []
#         return items
#     except Exception:
#         return _rss_to_items(r.text)


# from typing import List, Dict


# def chunked(lst, n: int):
#     for i in range(0, len(lst), n):
#         yield lst[i:i+n]


# def upsert_articles(items: List[Dict]):
#     global last_items

#     if not items:
#         last_items = []
#         return 0

#     cleaned = []
#     seen_in_batch = set()

#     for it in items:
#         # ✅ item에서 원문 URL 우선 확보
#         origin_url = resolve_origin_url(it)
#         url = normalize_url(origin_url)
#         if not url:
#             continue
#         if len(url) > MAX_URL_LEN:
#             continue

#         if url in seen_in_batch:
#             continue
#         seen_in_batch.add(url)

#         title = (it.get("title", "") or "").strip()

#         # ✅ 썸네일: 원문에서 og:image 추출
#         thumb = it.get("thumbnail") or it.get("image") or None
#         if not thumb:
#             thumb = fetch_og_image(url)

#         content = it.get("content") or it.get("summary") or None
#         raw_dt = it.get("published_at") or it.get("published")
#         pub_dt = parse_dt(raw_dt)

#         cleaned.append({
#             "url": url,
#             "title": title,
#             "thumbnail": thumb,
#             "content": content,
#             "pub_dt": pub_dt,
#             "raw_dt": raw_dt,
#         })

#     if not cleaned:
#         last_items = []
#         return 0

#     urls = [c["url"] for c in cleaned]

#     existing = set()
#     conn = None
#     try:
#         conn = get_conn()
#         with conn.cursor() as cur:
#             for part in chunked(urls, 500):
#                 placeholders = ",".join(["%s"] * len(part))
#                 cur.execute(
#                     f"SELECT url FROM articles WHERE url IN ({placeholders})",
#                     tuple(part),
#                 )
#                 for row in cur.fetchall():
#                     existing.add(row["url"])

#             to_insert = [c for c in cleaned if c["url"] not in existing]

#             sql = """
#             INSERT INTO articles (url, title, thumbnail, content, published_at, category, created_at)
#             VALUES (%s, %s, %s, %s, %s, %s, NOW())
#             """

#             params = []
#             node_items = []
#             for c in to_insert:
#                 category = "기타"
#                 params.append((
#                     c["url"],
#                     c["title"],
#                     c["thumbnail"],
#                     c["content"],
#                     c["pub_dt"],
#                     category,
#                 ))
#                 node_items.append({
#                     "url": c["url"],
#                     "title": c["title"],
#                     "thumbnail": c["thumbnail"],
#                     "content": c["content"],
#                     "category": category,
#                     "published_at": c["raw_dt"],
#                 })

#             saved = 0
#             if params:
#                 cur.executemany(sql, params)
#                 saved = len(params)

#             last_items = node_items
#             print(
#                 f"[crawler] upsert done saved={saved} skipped_existing={len(existing)} batch_total={len(cleaned)}",
#                 flush=True
#             )
#             return saved

#     except Exception as e:
#         print("[crawler] db error:", repr(e), flush=True)
#         last_items = []
#         return 0

#     finally:
#         if conn:
#             conn.close()


# def run_once():
#     global _is_running
#     if _is_running:
#         print("[crawler] run_once already running. skip.", flush=True)
#         return

#     _is_running = True
#     print("[crawler] run_once start", flush=True)

#     got = acquire_db_lock()
#     print(f"[crawler] db lock got={got}", flush=True)
#     if not got:
#         _is_running = False
#         print("[crawler] another instance holds DB lock. skip.", flush=True)
#         return

#     try:
#         print("[crawler] fetching...", flush=True)
#         items = fetch_news_items()
#         print(f"[crawler] fetched items={len(items)}", flush=True)

#         print("[crawler] upserting...", flush=True)
#         saved = upsert_articles(items)
#         print(f"[crawler] saved={saved}", flush=True)
#     except Exception as e:
#         print("[crawler] run_once error:", repr(e), flush=True)
#     finally:
#         release_db_lock()
#         print("[crawler] db lock released", flush=True)
#         _is_running = False


# def crawler_loop():
#     initial_delay = random.uniform(10, 60)
#     print(f"[crawler] initial delay {initial_delay:.1f}s", flush=True)
#     time.sleep(initial_delay)

#     while True:
#         try:
#             run_once()
#         except Exception as e:
#             print("[crawler] loop error:", repr(e), flush=True)

#         base = CRAWL_INTERVAL_SEC
#         jitter = random.uniform(0, min(30, base * 0.05))
#         time.sleep(base + jitter)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     threading.Thread(target=crawler_loop, daemon=True).start()
#     yield


# app = FastAPI(lifespan=lifespan)


# @app.get("/crawl")
# def get_items():
#     return {"items": last_items}


# @app.get("/run")
# def run_crawl():
#     print("[crawler] /run hit -> start thread", flush=True)
#     threading.Thread(target=run_once, daemon=True).start()
#     return {"ok": True, "message": "crawl started"}