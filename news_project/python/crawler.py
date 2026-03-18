import os
import io
import csv
import re
import time
import random
import threading
import zipfile
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse

import requests
import pymysql
from fastapi import FastAPI
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import tldextract
except ImportError:
    tldextract = None

# -----------------------------
# Config
# -----------------------------
DB_HOST = os.getenv("DB_HOST", "project-db-cgi.smhrd.com")
DB_PORT = int(os.getenv("DB_PORT", "3307"))
DB_USER = os.getenv("DB_USER", "cgi_25K_DA1_p3_3")
DB_PASSWORD = os.getenv("DB_PASSWORD", "smhrd3")
DB_NAME = os.getenv("DB_NAME", "cgi_25K_DA1_p3_3")

CRAWL_INTERVAL_SEC = int(os.getenv("CRAWL_INTERVAL_SEC", "1800"))
MIN_CALL_INTERVAL_SEC = int(os.getenv("MIN_CALL_INTERVAL_SEC", "600"))
MAX_URL_LEN = int(os.getenv("MAX_URL_LEN", "500"))

DB_LOCK_NAME = os.getenv("DB_LOCK_NAME", "news_project_crawler_lock")
TRACKING_CSV_PATH = os.getenv("TRACKING_CSV_PATH", "/app/data/korea.csv")

GDELT_MASTERFILE_URL = os.getenv(
    "GDELT_MASTERFILE_URL",
    "http://data.gdeltproject.org/gdeltv2/masterfilelist.txt",
).strip()

GDELT_LOOKBACK_FILES = int(os.getenv("GDELT_LOOKBACK_FILES", "384"))
GDELT_MAX_ITEMS_PER_RUN = int(os.getenv("GDELT_MAX_ITEMS_PER_RUN", "1000"))
GDELT_DOWNLOAD_TIMEOUT_CONNECT = int(os.getenv("GDELT_DOWNLOAD_TIMEOUT_CONNECT", "10"))
GDELT_DOWNLOAD_TIMEOUT_READ = int(os.getenv("GDELT_DOWNLOAD_TIMEOUT_READ", "180"))

FETCH_ARTICLE_TEXT = os.getenv("FETCH_ARTICLE_TEXT", "true").strip().lower() in ("1", "true", "yes", "y")
FETCH_ARTICLE_TEXT_MAXLEN = int(os.getenv("FETCH_ARTICLE_TEXT_MAXLEN", "8000"))
ARTICLE_FETCH_WORKERS = int(os.getenv("ARTICLE_FETCH_WORKERS", "12"))

CRAWL_DOMAIN_ALLOWLIST = os.getenv("CRAWL_DOMAIN_ALLOWLIST", "").strip()
MIN_CONTENT_LEN = int(os.getenv("MIN_CONTENT_LEN", "80"))

# 최근 며칠치만 저장할지 (오늘 포함 4일 = 오늘, 어제, 2일 전, 3일 전)
RECENT_DAYS_INCLUDING_TODAY = int(os.getenv("RECENT_DAYS_INCLUDING_TODAY", "4"))

# -----------------------------
# Timezone
# -----------------------------
UTC = timezone.utc
KST = timezone(timedelta(hours=9))

# -----------------------------
# Runtime state
# -----------------------------
last_items = []
_og_cache = {}
_meta_cache = {}
_allowed_domains = None

_last_call_ts = 0.0
_backoff_until = 0.0
_fail_count = 0

_is_running = False

_session = requests.Session()
_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    "Accept": "text/plain, application/json, application/xml, text/xml, text/html, */*",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7",
})

# -----------------------------
# GKG column indexes
# -----------------------------
IDX_GKGRECORDID = 0
IDX_DATE = 1
IDX_SOURCE_COLLECTION_IDENTIFIER = 2
IDX_SOURCE_COMMON_NAME = 3
IDX_DOCUMENT_IDENTIFIER = 4
IDX_COUNTS = 5
IDX_V2COUNTS = 6
IDX_THEMES = 7
IDX_V2THEMES = 8
IDX_LOCATIONS = 9
IDX_V2LOCATIONS = 10
IDX_PERSONS = 11
IDX_V2PERSONS = 12
IDX_ORGANIZATIONS = 13
IDX_V2ORGANIZATIONS = 14
IDX_V2TONE = 15
IDX_DATES = 16
IDX_GCAM = 17
IDX_SHARING_IMAGE = 18
IDX_RELATED_IMAGES = 19
IDX_SOCIAL_IMAGE_EMBEDS = 20
IDX_SOCIAL_VIDEO_EMBEDS = 21
IDX_QUOTATIONS = 22
IDX_ALLNAMES = 23
IDX_AMOUNTS = 24
IDX_TRANSLATIONINFO = 25
IDX_EXTRAS = 26


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
    if not raw_dt:
        return None

    s = str(raw_dt).strip()

    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt.astimezone(UTC)
    except Exception:
        pass

    try:
        dt = parsedate_to_datetime(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt.astimezone(UTC)
    except Exception:
        pass

    try:
        if re.fullmatch(r"\d{14}", s):
            dt = datetime.strptime(s, "%Y%m%d%H%M%S")
            return dt.replace(tzinfo=UTC)
    except Exception:
        pass

    try:
        if re.fullmatch(r"\d{8}", s):
            dt = datetime.strptime(s, "%Y%m%d")
            return dt.replace(tzinfo=UTC)
    except Exception:
        pass

    return None


def get_recent_window():
    """
    예: 오늘이 2026-03-17(KST)면
    시작 = 2026-03-14 00:00:00 KST
    끝   = 현재 시각 KST
    """
    now_kst = datetime.now(KST)
    start_day = (now_kst - timedelta(days=max(RECENT_DAYS_INCLUDING_TODAY - 1, 0))).date()
    start_kst = datetime.combine(start_day, datetime.min.time(), tzinfo=KST)
    end_kst = now_kst
    return start_kst, end_kst


def is_recent_dt(raw_dt) -> bool:
    dt = parse_dt(raw_dt)
    if not dt:
        return False

    start_kst, end_kst = get_recent_window()
    dt_kst = dt.astimezone(KST)
    return start_kst <= dt_kst <= end_kst


def parse_gkg_filename_dt(file_url: str):
    """
    GDELT 파일명 예:
    http://data.gdeltproject.org/gdeltv2/20260309071500.gkg.csv.zip
    """
    try:
        name = file_url.rsplit("/", 1)[-1]
        m = re.match(r"^(\d{14})\.gkg\.csv\.zip$", name)
        if not m:
            return None
        dt = datetime.strptime(m.group(1), "%Y%m%d%H%M%S")
        return dt.replace(tzinfo=UTC)
    except Exception:
        return None


def is_recent_gkg_file(file_url: str) -> bool:
    file_dt = parse_gkg_filename_dt(file_url)
    if not file_dt:
        return False

    start_kst, end_kst = get_recent_window()
    file_kst = file_dt.astimezone(KST)
    return start_kst <= file_kst <= end_kst


def sleep_full_jitter(max_sec: float):
    time.sleep(max(0.0, random.uniform(0.0, float(max_sec))))


def calc_backoff_seconds(fail_count: int, base: int, cap: int) -> int:
    sec = base * (2 ** min(fail_count - 1, 6))
    return int(min(sec, cap))


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


def normalize_host(raw: str) -> str:
    if not raw:
        return ""

    raw = str(raw).strip().lower()

    if "://" not in raw:
        raw = "http://" + raw

    try:
        parsed = urlparse(raw)
        host = parsed.netloc or parsed.path
    except Exception:
        host = raw

    host = host.strip().lower()
    host = host.split("@")[-1]
    host = host.split(":")[0]

    if host.startswith("www."):
        host = host[4:]

    if tldextract:
        try:
            ext = tldextract.extract(host)
            if ext.domain and ext.suffix:
                return f"{ext.domain}.{ext.suffix}".lower()
        except Exception:
            pass

    return host


def get_domain(url: str) -> str:
    try:
        if not url:
            return ""
        parsed = urlparse(url)
        host = (parsed.netloc or "").lower().strip()
        host = host.split("@")[-1]
        host = host.split(":")[0]
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        return ""


def get_root_domain(value: str) -> str:
    return normalize_host(value)


def is_english_url(url: str) -> bool:
    if not url:
        return False

    u = url.lower().strip()

    blocked_patterns = [
        "/english/",
        "/english_edition/",
        "/english-edition/",
        "/englishnews/",
        "/english-news/",
        "/eng/",
        "lang=e",
        "lang=en",
        "locale=en",
        "hl=en",
        "/en/",
        "/en-us/",
        "/global/",
    ]
    return any(p in u for p in blocked_patterns)


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = str(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def count_hangul(text: str) -> int:
    if not text:
        return 0
    return len(re.findall(r"[가-힣]", str(text)))


def count_english(text: str) -> int:
    if not text:
        return 0
    return len(re.findall(r"[A-Za-z]", str(text)))


def has_korean_article_signal(title: str, content: str) -> bool:
    """
    영어 기사 + 한국어 UI/메뉴가 섞인 페이지를 최대한 차단하기 위한 강화 판정
    """
    title = clean_text(title)
    content = clean_text(content)

    title_h = count_hangul(title)
    content_h = count_hangul(content)

    title_e = count_english(title)
    content_e = count_english(content)

    # 제목에 한글이 거의 없으면 탈락
    if title_h < 2:
        return False

    # 본문 한글이 너무 적으면 탈락
    if content_h < 100:
        return False

    # 본문이 영어 우세면 탈락
    if content_e > content_h * 1.5:
        return False

    # 제목이 영어 우세면 탈락
    if title_e > title_h * 2:
        return False

    return True


def domain_matches(domain: str, allow_domains: set[str]) -> bool:
    """
    allow_domains에 root domain이 들어있으면
    news.kbs.co.kr / m.yna.co.kr 같은 서브도메인도 허용
    """
    if not allow_domains:
        return True
    if not domain:
        return False

    domain = str(domain).strip().lower()
    if domain.startswith("www."):
        domain = domain[4:]

    # 영어판/글로벌판 서브도메인 차단
    if domain.startswith(("world.", "english.", "en.", "global.")):
        return False

    root = get_root_domain(domain)

    if domain in allow_domains:
        return True
    if root in allow_domains:
        return True

    for base in allow_domains:
        base = str(base).strip().lower()
        if not base:
            continue
        if domain == base or domain.endswith("." + base):
            return True

    return False


def extract_domain_from_text(value: str) -> str:
    if not value:
        return ""

    value = str(value).strip()

    if value.startswith("http://") or value.startswith("https://"):
        return get_root_domain(value)

    value = value.lower().strip().strip("/")
    if value.startswith("www."):
        value = value[4:]

    if "." in value and " " not in value:
        return get_root_domain(value)

    return ""


def load_allowed_domains_from_csv(path: str) -> set[str]:
    domains = set()

    if not path or not os.path.exists(path):
        return domains

    try:
        with open(path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            fieldnames = [x.strip() for x in (reader.fieldnames or []) if x]
            preferred_cols = ["domain", "domains", "url", "site", "source", "press", "link", "homepage"]

            target_cols = [c for c in fieldnames if c.lower() in preferred_cols]
            if not target_cols:
                target_cols = fieldnames

            for row in reader:
                for col in target_cols:
                    val = row.get(col)
                    dom = extract_domain_from_text(val)
                    if dom:
                        domains.add(dom)
    except Exception as e:
        print("[crawler] load_allowed_domains_from_csv error:", repr(e), flush=True)

    return domains


def get_allowed_domains() -> set[str]:
    global _allowed_domains

    if _allowed_domains is not None:
        return _allowed_domains

    domains = set()

    if CRAWL_DOMAIN_ALLOWLIST:
        for part in CRAWL_DOMAIN_ALLOWLIST.split(","):
            dom = extract_domain_from_text(part)
            if dom:
                domains.add(dom)
        print(f"[crawler] domains loaded from env count={len(domains)}", flush=True)

    if not domains:
        domains = load_allowed_domains_from_csv(TRACKING_CSV_PATH)
        print(f"[crawler] domains loaded from csv count={len(domains)}", flush=True)

    _allowed_domains = domains
    print(f"[crawler] allowed_domains loaded count={len(_allowed_domains)}", flush=True)
    return _allowed_domains


def is_bad_thumb(img: str) -> bool:
    if not img:
        return True

    s = img.lower().strip()
    if "favicon" in s or "icon" in s:
        return True
    if "logo" in s and ("google" in s or "gstatic" in s):
        return True
    if s.startswith("data:image/") and len(s) < 200:
        return True
    return False


def first_url_from_blob(blob: str):
    if not blob:
        return None

    candidates = re.findall(r'https?://[^\s,;<>"]+', str(blob))
    for c in candidates:
        c = c.strip()
        if c and not is_bad_thumb(c):
            return c
    return None


def extract_page_title(soup: BeautifulSoup):
    candidates = [
        ("meta", {"property": "og:title"}, "content"),
        ("meta", {"name": "og:title"}, "content"),
        ("meta", {"property": "twitter:title"}, "content"),
        ("meta", {"name": "twitter:title"}, "content"),
    ]

    for tag_name, attrs, field in candidates:
        m = soup.find(tag_name, attrs=attrs)
        if m and m.get(field):
            title = str(m.get(field)).strip()
            if title:
                return title

    if soup.title and soup.title.string:
        title = soup.title.string.strip()
        if title:
            return title

    h1 = soup.find("h1")
    if h1:
        title = h1.get_text(" ", strip=True)
        if title:
            return title

    return None


def extract_page_image(soup: BeautifulSoup):
    candidates = [
        ("meta", {"property": "og:image"}, "content"),
        ("meta", {"name": "og:image"}, "content"),
        ("meta", {"property": "twitter:image"}, "content"),
        ("meta", {"name": "twitter:image"}, "content"),
        ("meta", {"property": "twitter:image:src"}, "content"),
        ("meta", {"name": "twitter:image:src"}, "content"),
    ]

    for tag_name, attrs, field in candidates:
        m = soup.find(tag_name, attrs=attrs)
        if m and m.get(field):
            img = str(m.get(field)).strip()
            if img and not is_bad_thumb(img):
                return img

    return None


def extract_page_text(soup: BeautifulSoup):
    for tag in soup(["script", "style", "noscript", "iframe", "header", "footer", "aside", "nav"]):
        tag.decompose()

    article = soup.find("article")
    if article:
        text = article.get_text(" ", strip=True)
    else:
        selectors = [
            {"id": re.compile(r"(article|content|news|story|body|main|post)", re.I)},
            {"class": re.compile(r"(article|content|news|story|body|main|post)", re.I)},
        ]
        target = None
        for sel in selectors:
            target = soup.find(attrs=sel)
            if target:
                break

        if target:
            text = target.get_text(" ", strip=True)
        else:
            ps = soup.find_all("p")
            if ps:
                text = " ".join(p.get_text(" ", strip=True) for p in ps[:40])
            else:
                return None

    text = clean_text(text)
    if not text:
        return None

    if len(text) > FETCH_ARTICLE_TEXT_MAXLEN:
        text = text[:FETCH_ARTICLE_TEXT_MAXLEN]

    return text


def fetch_page_meta(url: str, allow_domains: set[str]) -> dict:
    if not url:
        return {
            "title": None,
            "thumbnail": None,
            "content": None,
            "is_korean": False,
            "final_url": None,
            "final_domain": None,
        }

    cache_key = f"{url}|{len(allow_domains)}"
    if cache_key in _meta_cache:
        return _meta_cache[cache_key]

    result = {
        "title": None,
        "thumbnail": None,
        "content": None,
        "is_korean": False,
        "final_url": None,
        "final_domain": None,
    }

    try:
        r = _session.get(
            url,
            timeout=(6, 20),
            allow_redirects=True,
            headers={
                "User-Agent": _session.headers["User-Agent"],
                "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6",
            },
        )

        if r.status_code >= 400:
            _meta_cache[cache_key] = result
            return result

        final_url = str(r.url or url).strip()
        final_domain = get_domain(final_url)

        if is_english_url(final_url):
            _meta_cache[cache_key] = result
            return result

        if allow_domains and not domain_matches(final_domain, allow_domains):
            _meta_cache[cache_key] = result
            return result

        try:
            apparent = (r.apparent_encoding or "").strip()
        except Exception:
            apparent = ""

        if apparent:
            try:
                r.encoding = apparent
            except Exception:
                pass
        elif not r.encoding or r.encoding.lower() == "iso-8859-1":
            r.encoding = "utf-8"

        html = r.text or ""
        if not html:
            _meta_cache[cache_key] = result
            return result

        soup = BeautifulSoup(html, "html.parser")

        title = clean_text(extract_page_title(soup) or "")
        thumbnail = extract_page_image(soup)
        content = clean_text(extract_page_text(soup) or "") if FETCH_ARTICLE_TEXT else ""

        # 제목이 거의 영어면 바로 차단
        if count_hangul(title) < 2 and count_english(title) >= 10:
            _meta_cache[cache_key] = result
            return result

        # 본문이 영어 우세면 바로 차단
        if count_english(content) > max(count_hangul(content) * 2, 200):
            _meta_cache[cache_key] = result
            return result

        if not has_korean_article_signal(title, content):
            print(
                "[crawler] non-korean fail",
                {
                    "url": final_url,
                    "title_preview": title[:100],
                    "title_hangul": count_hangul(title),
                    "title_english": count_english(title),
                    "content_hangul": count_hangul(content),
                    "content_english": count_english(content),
                    "content_preview": content[:150],
                },
                flush=True
            )
            _meta_cache[cache_key] = result
            return result

        result = {
            "title": title if title else None,
            "thumbnail": thumbnail,
            "content": content if content else None,
            "is_korean": True,
            "final_url": final_url,
            "final_domain": final_domain,
        }

        _meta_cache[cache_key] = result
        return result

    except Exception as e:
        print("[crawler] fetch_page_meta error:", repr(e), "url=", url, flush=True)
        _meta_cache[cache_key] = result
        return result


def fetch_og_image(url: str):
    if not url:
        return None

    if url in _og_cache:
        return _og_cache[url]

    try:
        meta = fetch_page_meta(url, get_allowed_domains())
        img = meta.get("thumbnail")
        if img and is_bad_thumb(img):
            img = None
        _og_cache[url] = img
        return img
    except Exception:
        _og_cache[url] = None
        return None


def chunked(lst, n: int):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def fetch_existing_urls(urls: list[str]) -> set[str]:
    existing = set()
    if not urls:
        return existing

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            for part in chunked(urls, 500):
                placeholders = ",".join(["%s"] * len(part))
                cur.execute(
                    f"SELECT url FROM articles WHERE url IN ({placeholders})",
                    tuple(part),
                )
                for row in cur.fetchall():
                    existing.add(normalize_url(row["url"]))
        return existing
    except Exception as e:
        print("[crawler] fetch_existing_urls db error:", repr(e), flush=True)
        return existing
    finally:
        if conn:
            conn.close()


def fetch_masterfile_lines() -> list[str]:
    global _last_call_ts, _backoff_until, _fail_count

    now = time.time()

    if now < _backoff_until:
        wait = _backoff_until - now
        print(f"[crawler] backoff active. wait {wait:.1f}s", flush=True)
        sleep_full_jitter(wait)
        return []

    since = now - _last_call_ts
    if since < MIN_CALL_INTERVAL_SEC:
        sleep_full_jitter(MIN_CALL_INTERVAL_SEC - since)

    try:
        r = _session.get(
            GDELT_MASTERFILE_URL,
            timeout=(GDELT_DOWNLOAD_TIMEOUT_CONNECT, GDELT_DOWNLOAD_TIMEOUT_READ),
            allow_redirects=True,
            headers={"User-Agent": "news_project_crawler/1.0 (+https://localhost)"},
        )
        _last_call_ts = time.time()
    except requests.RequestException as e:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=10, cap=1800)
        _backoff_until = time.time() + backoff
        print("[crawler] masterfile request error:", repr(e), f"-> backoff {backoff}s", flush=True)
        return []

    if r.status_code == 429:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=60, cap=1800)
        _backoff_until = time.time() + backoff
        print(f"[crawler] masterfile 429 -> backoff {backoff}s", flush=True)
        return []

    if r.status_code >= 400:
        _fail_count += 1
        backoff = calc_backoff_seconds(_fail_count, base=10, cap=1800)
        _backoff_until = time.time() + backoff
        print(f"[crawler] masterfile http error status={r.status_code} -> backoff {backoff}s", flush=True)
        return []

    _fail_count = 0
    _backoff_until = 0.0

    text = r.text or ""
    lines = [x.strip() for x in text.splitlines() if x.strip()]
    return lines


def extract_latest_gkg_file_urls(lines: list[str]) -> list[str]:
    file_urls = []

    for line in lines:
        parts = line.split()
        if len(parts) < 3:
            continue

        url = parts[-1].strip()
        low = url.lower()

        if low.endswith(".gkg.csv.zip") and "/gdeltv2/" in low:
            if is_recent_gkg_file(url):
                file_urls.append(url)

    file_urls = sorted(set(file_urls))
    return file_urls[-GDELT_LOOKBACK_FILES:]


def parse_gkg_zip_file(file_url: str, allow_domains: set[str]) -> list[dict]:
    print(f"[crawler] downloading gkg zip: {file_url}", flush=True)

    try:
        r = _session.get(
            file_url,
            timeout=(GDELT_DOWNLOAD_TIMEOUT_CONNECT, GDELT_DOWNLOAD_TIMEOUT_READ),
            allow_redirects=True,
            headers={"User-Agent": "news_project_crawler/1.0 (+https://localhost)"},
        )
        if r.status_code >= 400:
            print(f"[crawler] gkg zip http error status={r.status_code}", flush=True)
            return []
    except requests.RequestException as e:
        print("[crawler] gkg zip request error:", repr(e), flush=True)
        return []

    matched_items = []
    seen = set()

    total_rows = 0
    skipped_bad_url = 0
    skipped_english_url = 0
    skipped_old_date = 0
    skipped_domain = 0
    duplicate_rows = 0

    sample_unmatched_domains = []

    try:
        with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
            names = zf.namelist()
            if not names:
                return []

            inner = names[0]
            with zf.open(inner, "r") as fp:
                wrapper = io.TextIOWrapper(fp, encoding="utf-8", errors="replace", newline="")
                for raw_line in wrapper:
                    line = raw_line.rstrip("\n")
                    if not line:
                        continue

                    total_rows += 1
                    cols = line.split("\t")
                    if len(cols) < 5:
                        continue

                    try:
                        url = normalize_url(cols[IDX_DOCUMENT_IDENTIFIER])
                    except Exception:
                        continue

                    if not url or len(url) > MAX_URL_LEN:
                        skipped_bad_url += 1
                        continue

                    if is_english_url(url):
                        skipped_english_url += 1
                        continue

                    if url in seen:
                        duplicate_rows += 1
                        continue
                    seen.add(url)

                    published_raw = cols[IDX_DATE] if len(cols) > IDX_DATE else None
                    if not is_recent_dt(published_raw):
                        skipped_old_date += 1
                        continue

                    domain = get_domain(url)

                    if "lang=e" in url.lower():
                        skipped_english_url += 1
                        continue

                    if domain.startswith(("world.", "english.", "en.", "global.")):
                        skipped_english_url += 1
                        continue

                    if allow_domains and not domain_matches(domain, allow_domains):
                        skipped_domain += 1
                        if len(sample_unmatched_domains) < 20:
                            sample_unmatched_domains.append(domain)
                        continue

                    source_common_name = cols[IDX_SOURCE_COMMON_NAME] if len(cols) > IDX_SOURCE_COMMON_NAME else ""

                    thumb = None
                    if len(cols) > IDX_SHARING_IMAGE:
                        thumb = first_url_from_blob(cols[IDX_SHARING_IMAGE])

                    if not thumb and len(cols) > IDX_RELATED_IMAGES:
                        thumb = first_url_from_blob(cols[IDX_RELATED_IMAGES])

                    if not thumb and len(cols) > IDX_SOCIAL_IMAGE_EMBEDS:
                        thumb = first_url_from_blob(cols[IDX_SOCIAL_IMAGE_EMBEDS])

                    if thumb and is_bad_thumb(thumb):
                        thumb = None

                    matched_items.append({
                        "url": url,
                        "title": None,
                        "thumbnail": thumb,
                        "content": None,
                        "published_at": published_raw,
                        "category": "기타",
                        "source_common_name": source_common_name,
                        "domain": domain,
                    })

                    if len(matched_items) >= GDELT_MAX_ITEMS_PER_RUN:
                        break

    except Exception as e:
        print("[crawler] parse_gkg_zip_file error:", repr(e), flush=True)
        return []

    print(
        f"[crawler] parsed items from zip={len(matched_items)} total_rows={total_rows} "
        f"skipped_bad_url={skipped_bad_url} skipped_english_url={skipped_english_url} "
        f"skipped_old_date={skipped_old_date} skipped_domain={skipped_domain} "
        f"duplicate_rows={duplicate_rows}",
        flush=True
    )

    if sample_unmatched_domains:
        print(f"[crawler] sample unmatched domains={sample_unmatched_domains}", flush=True)

    return matched_items


def enrich_items(raw_items: list[dict], allow_domains: set[str]) -> list[dict]:
    if not raw_items:
        return []

    urls = [normalize_url(x["url"]) for x in raw_items if x.get("url")]
    existing = fetch_existing_urls(urls)

    print(f"[crawler] raw candidate urls={urls}", flush=True)
    print(f"[crawler] existing matched urls={[u for u in urls if u in existing]}", flush=True)

    targets = [x for x in raw_items if normalize_url(x["url"]) not in existing]
    print(f"[crawler] enrich targets={len(targets)} existing={len(existing)}", flush=True)
    if not targets:
        return []

    results = []
    futures = {}

    skipped_no_title = 0
    skipped_non_korean = 0
    skipped_short_content = 0
    skipped_old_after_fetch = 0
    skipped_existing_final_url = 0

    final_existing_cache = set(existing)
    batch_final_seen = set()

    with ThreadPoolExecutor(max_workers=max(1, ARTICLE_FETCH_WORKERS)) as ex:
        for item in targets:
            futures[ex.submit(fetch_page_meta, item["url"], allow_domains)] = item

        for fut in as_completed(futures):
            item = futures[fut]

            meta = {
                "title": None,
                "thumbnail": None,
                "content": None,
                "is_korean": False,
                "final_url": None,
                "final_domain": None,
            }

            try:
                meta = fut.result()
            except Exception:
                pass

            if not meta.get("is_korean"):
                skipped_non_korean += 1
                continue

            if not is_recent_dt(item.get("published_at")):
                skipped_old_after_fetch += 1
                continue

            final_url = normalize_url(meta.get("final_url") or item["url"] or "")
            title = clean_text(meta.get("title") or "")
            content = clean_text(meta.get("content") or "")

            if not final_url:
                skipped_non_korean += 1
                continue

            if final_url in final_existing_cache or final_url in batch_final_seen:
                skipped_existing_final_url += 1
                continue

            batch_final_seen.add(final_url)

            thumb = item.get("thumbnail")
            if (not thumb) or is_bad_thumb(thumb):
                thumb = meta.get("thumbnail") or fetch_og_image(final_url)

            if not title:
                skipped_no_title += 1
                continue

            if not has_korean_article_signal(title, content):
                skipped_non_korean += 1
                continue

            if content and len(content) < MIN_CONTENT_LEN and len(title) < 8:
                skipped_short_content += 1
                continue

            results.append({
                "url": final_url,
                "title": title,
                "thumbnail": thumb,
                "content": content,
                "published_at": item.get("published_at"),
                "category": item.get("category") or "기타",
            })

    print(
        f"[crawler] enrich done={len(results)} "
        f"skipped_no_title={skipped_no_title} "
        f"skipped_non_korean={skipped_non_korean} "
        f"skipped_short_content={skipped_short_content} "
        f"skipped_old_after_fetch={skipped_old_after_fetch} "
        f"skipped_existing_final_url={skipped_existing_final_url}",
        flush=True
    )

    return results


def fetch_news_items():
    start_kst, end_kst = get_recent_window()
    print(
        f"[crawler] recent window KST start={start_kst.strftime('%Y-%m-%d %H:%M:%S %Z')} "
        f"end={end_kst.strftime('%Y-%m-%d %H:%M:%S %Z')}",
        flush=True
    )

    lines = fetch_masterfile_lines()
    if not lines:
        return []

    allow_domains = get_allowed_domains()
    file_urls = extract_latest_gkg_file_urls(lines)

    if not file_urls:
        print("[crawler] no recent gkg file urls found in masterfilelist", flush=True)
        return []

    file_urls = list(reversed(file_urls))

    all_raw_items = []
    seen_urls = set()
    used_file_count = 0

    for file_url in file_urls:
        items = parse_gkg_zip_file(file_url, allow_domains)

        if not items:
            continue

        used_file_count += 1

        for item in items:
            url = normalize_url(item.get("url"))
            if not url:
                continue
            if url in seen_urls:
                continue

            seen_urls.add(url)
            all_raw_items.append(item)

            if len(all_raw_items) >= GDELT_MAX_ITEMS_PER_RUN:
                break

        if len(all_raw_items) >= GDELT_MAX_ITEMS_PER_RUN:
            break

    print(
        f"[crawler] collected raw items total={len(all_raw_items)} from_files={used_file_count}",
        flush=True
    )

    if not all_raw_items:
        return []

    return enrich_items(all_raw_items, allow_domains)


def upsert_articles(items: list[dict]):
    global last_items

    if not items:
        last_items = []
        return 0

    cleaned = []
    seen_in_batch = set()

    for it in items:
        url = normalize_url(it.get("url"))
        if not url:
            continue
        if len(url) > MAX_URL_LEN:
            continue
        if url in seen_in_batch:
            continue
        seen_in_batch.add(url)

        title = clean_text(it.get("title", "") or "")
        content = clean_text(it.get("content") or "")

        if not title:
            continue

        # 저장 직전 마지막 한국어 기사 재검사
        if not has_korean_article_signal(title, content):
            continue

        thumb = it.get("thumbnail") or None
        if thumb and is_bad_thumb(thumb):
            thumb = None
        if not thumb:
            thumb = fetch_og_image(url)

        raw_dt = it.get("published_at")
        pub_dt = parse_dt(raw_dt)

        if not pub_dt:
            continue

        if not is_recent_dt(pub_dt):
            continue

        category = (it.get("category") or "").strip() or "기타"

        cleaned.append({
            "url": url,
            "title": title,
            "thumbnail": thumb,
            "content": content,
            "pub_dt": pub_dt,
            "raw_dt": raw_dt,
            "category": category,
        })

    if not cleaned:
        last_items = []
        return 0

    urls = [c["url"] for c in cleaned]
    existing = set()

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            for part in chunked(urls, 500):
                placeholders = ",".join(["%s"] * len(part))
                cur.execute(
                    f"SELECT url FROM articles WHERE url IN ({placeholders})",
                    tuple(part),
                )
                for row in cur.fetchall():
                    existing.add(normalize_url(row["url"]))

            to_insert = [c for c in cleaned if c["url"] not in existing]

            sql = """
            INSERT INTO articles (url, title, thumbnail, content, published_at, category, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """

            params = []
            node_items = []

            for c in to_insert:
                params.append((
                    c["url"],
                    c["title"],
                    c["thumbnail"],
                    c["content"],
                    c["pub_dt"],
                    c["category"],
                ))
                node_items.append({
                    "url": c["url"],
                    "title": c["title"],
                    "thumbnail": c["thumbnail"],
                    "content": c["content"],
                    "category": c["category"],
                    "published_at": c["raw_dt"],
                })

            saved = 0
            if params:
                cur.executemany(sql, params)
                saved = len(params)

            last_items = node_items
            print(
                f"[crawler] upsert done saved={saved} skipped_existing={len(existing)} batch_total={len(cleaned)}",
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


@app.get("/run")
def run_crawl():
    print("[crawler] /run hit -> start thread", flush=True)
    threading.Thread(target=run_once, daemon=True).start()
    return {"ok": True, "message": "crawl started"}