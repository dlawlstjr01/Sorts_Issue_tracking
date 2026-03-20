import os
import re
import time
import random
import threading
import pymysql
import requests

from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from xml.etree import ElementTree as ET

from fastapi import FastAPI
from bs4 import BeautifulSoup

# -----------------------------
# Config
# -----------------------------
DB_HOST = os.getenv("DB_HOST", "project-db-cgi.smhrd.com")
DB_PORT = int(os.getenv("DB_PORT", "3307"))
DB_USER = os.getenv("DB_USER", "cgi_25K_DA1_p3_3")
DB_PASSWORD = os.getenv("DB_PASSWORD", "smhrd3")
DB_NAME = os.getenv("DB_NAME", "cgi_25K_DA1_p3_3")

CRAWL_INTERVAL_SEC = int(os.getenv("CRAWL_INTERVAL_SEC", "1800"))
MAX_URL_LEN = int(os.getenv("MAX_URL_LEN", "500"))
<<<<<<< HEAD
MIN_CONTENT_LEN = int(os.getenv("MIN_CONTENT_LEN", "120"))
ARTICLE_FETCH_WORKERS = int(os.getenv("ARTICLE_FETCH_WORKERS", "10"))
RECENT_DAYS_INCLUDING_TODAY = int(os.getenv("RECENT_DAYS_INCLUDING_TODAY", "3"))
DB_LOCK_NAME = os.getenv("DB_LOCK_NAME", "news_project_crawler_lock")
MAX_ITEMS_PER_RUN = int(os.getenv("MAX_ITEMS_PER_RUN", "200"))

FETCH_ARTICLE_TEXT_MAXLEN = int(os.getenv("FETCH_ARTICLE_TEXT_MAXLEN", "8000"))
=======

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
>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273

# -----------------------------
# Timezone
# -----------------------------
UTC = timezone.utc
KST = timezone(timedelta(hours=9))

# -----------------------------
# Runtime state
# -----------------------------
last_items = []
_is_running = False
_meta_cache = {}

_session = requests.Session()
_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7",
})

# -----------------------------
# RSS Feed List
# -----------------------------
RSS_FEEDS = [
    # 한겨레
    {"name": "한겨레", "category": "정치", "url": "https://www.hani.co.kr/rss/politics/"},
    {"name": "한겨레", "category": "경제", "url": "https://www.hani.co.kr/rss/economy/"},
    {"name": "한겨레", "category": "사회", "url": "https://www.hani.co.kr/rss/society/"},
    {"name": "한겨레", "category": "국제", "url": "https://www.hani.co.kr/rss/international/"},
    {"name": "한겨레", "category": "문화", "url": "https://www.hani.co.kr/rss/culture/"},

    # 경향신문
    {"name": "경향신문", "category": "정치", "url": "https://www.khan.co.kr/rss/rssdata/politic_news.xml"},
    {"name": "경향신문", "category": "경제", "url": "https://www.khan.co.kr/rss/rssdata/economy_news.xml"},
    {"name": "경향신문", "category": "사회", "url": "https://www.khan.co.kr/rss/rssdata/society_news.xml"},
    {"name": "경향신문", "category": "국제", "url": "https://www.khan.co.kr/rss/rssdata/world_news.xml"},

    # 매일경제
    {"name": "매일경제", "category": "정치", "url": "https://www.mk.co.kr/rss/30200030/"},
    {"name": "매일경제", "category": "경제", "url": "https://www.mk.co.kr/rss/30100041/"},
    {"name": "매일경제", "category": "사회", "url": "https://www.mk.co.kr/rss/50400012/"},
    {"name": "매일경제", "category": "국제", "url": "https://www.mk.co.kr/rss/30300018/"},

    # 한국경제
    {"name": "한국경제", "category": "정치", "url": "https://www.hankyung.com/feed/politics"},
    {"name": "한국경제", "category": "경제", "url": "https://www.hankyung.com/feed/economy"},
    {"name": "한국경제", "category": "사회", "url": "https://www.hankyung.com/feed/society"},
    {"name": "한국경제", "category": "국제", "url": "https://www.hankyung.com/feed/international"},
    {"name": "한국경제", "category": "IT/과학", "url": "https://www.hankyung.com/feed/it"},

    # 노컷뉴스
    {"name": "노컷뉴스", "category": "정치", "url": "https://www.nocutnews.co.kr/rss/politics.xml"},
    {"name": "노컷뉴스", "category": "경제", "url": "https://www.nocutnews.co.kr/rss/economy.xml"},
    {"name": "노컷뉴스", "category": "사회", "url": "https://www.nocutnews.co.kr/rss/society.xml"},
    {"name": "노컷뉴스", "category": "국제", "url": "https://www.nocutnews.co.kr/rss/world.xml"},
]

# -----------------------------
# DB
# -----------------------------
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

# -----------------------------
# Utils
# -----------------------------
def normalize_url(u: str) -> str:
    if not u:
        return ""
    return str(u).strip()

<<<<<<< HEAD
def clean_text(text: str) -> str:
    if not text:
        return ""
    text = str(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
=======
>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273

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

    fmts = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y.%m.%d %H:%M",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M",
        "%a, %d %b %Y %H:%M:%S %z",
    ]
    for fmt in fmts:
        try:
            dt = datetime.strptime(s, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=KST)
            return dt.astimezone(UTC)
        except Exception:
            continue

    return None

def get_recent_window():
<<<<<<< HEAD
=======
    """
    예: 오늘이 2026-03-17(KST)면
    시작 = 2026-03-14 00:00:00 KST
    끝   = 현재 시각 KST
    """
>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273
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

def get_domain(url: str) -> str:
    try:
        parsed = urlparse(url)
        host = (parsed.netloc or "").strip().lower()
        host = host.split("@")[-1].split(":")[0]
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        return ""

def count_hangul(text: str) -> int:
    if not text:
        return 0
    return len(re.findall(r"[가-힣]", str(text)))

def count_english(text: str) -> int:
    if not text:
        return 0
    return len(re.findall(r"[A-Za-z]", str(text)))

def has_korean_article_signal(title: str, content: str) -> bool:
    title = clean_text(title)
    content = clean_text(content)

    title_h = count_hangul(title)
    content_h = count_hangul(content)
    title_e = count_english(title)
    content_e = count_english(content)

    if title_h < 2:
        return False
    if content_h < 80:
        return False
    if title_e > max(title_h * 5, 40):
        return False
    if content_e > max(content_h * 4, 1200):
        return False

    return True

def is_bad_thumb(img: str) -> bool:
    if not img:
        return True
    s = str(img).lower().strip()
    if "favicon" in s or "icon" in s:
        return True
    if s.startswith("data:image/") and len(s) < 200:
        return True
    return False

def extract_page_text(soup: BeautifulSoup, url: str = ""):
    if not soup:
        return None

    article = find_article_node(soup, url)

    if not article:
        return None

    # 복사본처럼 다루기 위해 다시 파싱
    article = BeautifulSoup(str(article), "html.parser")
    remove_noise_tags(article)

    blocks = []

    # 문단 우선 추출
    for tag in article.select("p"):
        text = clean_text(tag.get_text(" ", strip=True))
        if not text:
            continue

        # UI/노이즈 문구 필터
        if any(bad in text for bad in [
            "글자 크기", "글자크기", "닫기", "번역", "공유", "인쇄", "즐겨찾기",
            "댓글", "AI 기능", "AI기능", "핵심요약", "추천질문", "관련종목",
            "AI해설", "에디터 픽", "추천기사", "주요뉴스", "Powered by perplexity"
        ]):
            continue

        # 너무 짧은 잡문 제외
        if len(text) < 8:
            continue

        blocks.append(text)

    # p가 부족하면 li/div도 일부 보조적으로 사용
    if len(" ".join(blocks)) < MIN_CONTENT_LEN:
        extra_blocks = []
        for tag in article.select("li, div"):
            text = clean_text(tag.get_text(" ", strip=True))
            if not text:
                continue
            if len(text) < 20:
                continue
            if any(bad in text for bad in [
                "글자 크기", "글자크기", "닫기", "번역", "공유", "인쇄", "즐겨찾기",
                "댓글", "AI 기능", "AI기능", "핵심요약", "추천질문", "관련종목",
                "AI해설", "에디터 픽", "추천기사", "주요뉴스", "Powered by perplexity"
            ]):
                continue
            extra_blocks.append(text)

        # 중복 제거
        seen = set(blocks)
        for text in extra_blocks:
            if text not in seen:
                blocks.append(text)
                seen.add(text)

    # 마지막 방어: 문단 중복 제거
    deduped = []
    seen = set()
    for text in blocks:
        key = text.strip()
        if key and key not in seen:
            deduped.append(key)
            seen.add(key)

    content = "\n".join(deduped)
    content = clean_text(content.replace("\n", " \n ")).replace(" \n ", "\n").strip()

    if len(content) < MIN_CONTENT_LEN:
        return None

    return content[:FETCH_ARTICLE_TEXT_MAXLEN]

def extract_page_title(soup: BeautifulSoup):
    selectors = [
        ("meta", {"property": "og:title"}, "content"),
        ("meta", {"name": "og:title"}, "content"),
        ("meta", {"property": "twitter:title"}, "content"),
        ("meta", {"name": "twitter:title"}, "content"),
    ]
    for tag_name, attrs, field in selectors:
        m = soup.find(tag_name, attrs=attrs)
        if m and m.get(field):
            title = clean_text(m.get(field))
            if title:
                return title

    if soup.title and soup.title.string:
        return clean_text(soup.title.string)

    h1 = soup.find("h1")
    if h1:
        return clean_text(h1.get_text(" ", strip=True))

    return None

def extract_page_image(soup: BeautifulSoup):
    selectors = [
        ("meta", {"property": "og:image"}, "content"),
        ("meta", {"name": "og:image"}, "content"),
        ("meta", {"property": "twitter:image"}, "content"),
        ("meta", {"name": "twitter:image"}, "content"),
    ]
    for tag_name, attrs, field in selectors:
        m = soup.find(tag_name, attrs=attrs)
        if m and m.get(field):
            img = clean_text(m.get(field))
            if img and not is_bad_thumb(img):
                return img
    return None

def sort_items_latest(items: list[dict]) -> list[dict]:
    def sort_key(x):
        dt = parse_dt(x.get("published_at"))
        if not dt:
            return datetime.min.replace(tzinfo=UTC)
        return dt
    return sorted(items, key=sort_key, reverse=True)

# -----------------------------
# DB Lock
# -----------------------------
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

<<<<<<< HEAD
# -----------------------------
# Existing URL Check
# -----------------------------
=======

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

    noise_attr_re = re.compile(
        r"(related|recommend|popular|rank|ranking|comment|reply|share|subscribe|banner|advert|promo|outbrain|taboola|mostview)",
        re.I,
    )
    for tag in soup.find_all(attrs={"id": noise_attr_re}):
        tag.decompose()
    for tag in soup.find_all(attrs={"class": noise_attr_re}):
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


>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273
def chunked(lst, n: int):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

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
    except Exception as e:
        print("[crawler] fetch_existing_urls db error:", repr(e), flush=True)
    finally:
        if conn:
            conn.close()

    return existing

# -----------------------------
# RSS Parsing
# -----------------------------
def parse_rss_items(feed_xml: str, category: str) -> list[dict]:
    items = []
    if not feed_xml:
        return items

    try:
<<<<<<< HEAD
        root = ET.fromstring(feed_xml)
=======
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

>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273
    except Exception as e:
        print("[crawler] rss parse xml error:", repr(e), flush=True)
        return items

    channels = root.findall(".//channel")
    if not channels:
        channels = [root]

    for ch in channels:
        for item in ch.findall(".//item"):
            title = clean_text(item.findtext("title"))
            link = clean_text(item.findtext("link"))
            pub_date = clean_text(item.findtext("pubDate"))
            desc = clean_text(item.findtext("description"))

            thumb = None

            enclosure = item.find("enclosure")
            if enclosure is not None:
                thumb = clean_text(enclosure.attrib.get("url"))

            if not thumb:
                media_thumb = item.find("{http://search.yahoo.com/mrss/}thumbnail")
                if media_thumb is not None:
                    thumb = clean_text(media_thumb.attrib.get("url"))

<<<<<<< HEAD
            if not link or not title:
                continue

            items.append({
                "url": link,
=======
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
>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273
                "title": title,
                "thumbnail": thumb if thumb and not is_bad_thumb(thumb) else None,
                "content": desc or None,
                "published_at": pub_date,
                "category": category or "기타",
            })

<<<<<<< HEAD
    return items

def fetch_rss_feed(feed_info: dict) -> list[dict]:
    url = feed_info["url"]
    category = feed_info.get("category") or "기타"
=======
    print(
        f"[crawler] enrich done={len(results)} "
        f"skipped_no_title={skipped_no_title} "
        f"skipped_non_korean={skipped_non_korean} "
        f"skipped_short_content={skipped_short_content} "
        f"skipped_old_after_fetch={skipped_old_after_fetch} "
        f"skipped_existing_final_url={skipped_existing_final_url}",
        flush=True
    )
>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273

    try:
        r = _session.get(url, timeout=(8, 20), allow_redirects=True)
        if r.status_code >= 400:
            print(f"[crawler] rss http error status={r.status_code} url={url}", flush=True)
            return []

        if not r.encoding or r.encoding.lower() == "iso-8859-1":
            r.encoding = r.apparent_encoding or "utf-8"

<<<<<<< HEAD
        return parse_rss_items(r.text, category)
    except Exception as e:
        print("[crawler] fetch_rss_feed error:", repr(e), "url=", url, flush=True)
        return []

def remove_noise_tags(node: BeautifulSoup):
    if not node:
        return

    # 태그 자체 제거
    for tag in node.select(
        "script, style, noscript, iframe, header, footer, nav, aside, button, form, "
        "figure.ad, .ad, .ads, .advertisement, .banner, .sns, .share, .tool, .tools, "
        ".util, .utility, .promotion, .promo, .related, .relation, .recommend, "
        ".recommand, .ranking, .rank, .comment, .reply, .editor-pick, .ai, .ai-summary, "
        ".ai_wrap, .news_rel, .news_relate, .news_best, .byline, .reporter_area"
    ):
        tag.decompose()

    # 특정 문구 포함 요소 제거
    noise_keywords = [
        "글자 크기", "글자크기", "닫기", "번역", "공유", "인쇄", "즐겨찾기", "댓글",
        "AI 기능", "AI기능", "핵심요약", "추천질문", "관련종목", "AI해설",
        "에디터 픽", "추천기사", "주요뉴스", "좋아요", "Powered by perplexity",
        "이 기사가 마음에 들었다면", "매경에서 선정한 주요뉴스", "AI 요약은",
        "기사 AI 해설", "검색 닫기", "편의기능"
    ]

    for tag in node.find_all(True):
        txt = clean_text(tag.get_text(" ", strip=True))
        if not txt:
            continue
        if any(keyword in txt for keyword in noise_keywords):
            # 너무 큰 본문 루트 자체를 날려버리면 안 되므로,
            # 자식 블록성 요소만 제거
            if tag.name in ["div", "section", "aside", "ul", "ol"]:
                tag.decompose()

def find_article_node(soup: BeautifulSoup, url: str = ""):
    domain = get_domain(url)

    # 언론사별 우선 selector
    domain_selectors = {
        "mk.co.kr": [
            "div.news_cnt_detail_wrap",
            "div.art_txt",
            "section.news_cnt_detail_wrap",
            "#article_body",
        ],
        "hankyung.com": [
            "#articletxt",
            ".article-body",
            "#newsView",
            ".news_detail_area",
        ],
        "hani.co.kr": [
            "#renewal2022-article",
            ".article-text",
            ".text",
            "#article-text",
        ],
        "khan.co.kr": [
            "#articleBody",
            ".art_body",
            ".article_body",
            ".news_view",
        ],
        "nocutnews.co.kr": [
            "#pnlContent",
            ".article_content",
            ".view_cont",
            "#article_body",
        ],
    }

    # 1차: 도메인별 selector
    for key, selectors in domain_selectors.items():
        if domain.endswith(key):
            for sel in selectors:
                node = soup.select_one(sel)
                if node:
                    return node

    # 2차: 일반적인 article 계열
    generic_selectors = [
        "article",
        "#articleBody",
        "#article_body",
        ".article_body",
        ".article-body",
        ".articleBody",
        ".article_txt",
        ".article-text",
        ".news_cnt_detail_wrap",
        ".news_view",
        ".news_body",
        ".story-news",
        ".view_cont",
        "#articletxt",
        "#newsView",
    ]

    for sel in generic_selectors:
        node = soup.select_one(sel)
        if node:
            return node

    return None

def normalize_category(raw: str) -> str:
    if not raw:
        return "기타"

    v = str(raw).lower()

    if "polit" in v or "정치" in v:
        return "정치"

    if "econ" in v or "money" in v or "biz" in v or "경제" in v:
        return "경제"

    if "soc" in v or "사회" in v:
        return "사회"

    if "world" in v or "intl" in v or "inter" in v or "국제" in v:
        return "국제"

    if "it" in v or "tech" in v or "science" in v or "과학" in v:
        return "IT/과학"

    if "culture" in v or "ent" in v or "문화" in v:
        return "문화"

    if "sport" in v or "스포츠" in v:
        return "스포츠"

    return "기타"

# -----------------------------
# Article Fetch
# -----------------------------
def fetch_page_meta(url: str) -> dict:
    if not url:
        return {
            "title": None,
            "thumbnail": None,
            "content": None,
            "is_korean": False,
            "final_url": None,
        }

    if url in _meta_cache:
        return _meta_cache[url]

    result = {
        "title": None,
        "thumbnail": None,
        "content": None,
        "is_korean": False,
        "final_url": None,
    }

    try:
        r = _session.get(url, timeout=(8, 25), allow_redirects=True)
        if r.status_code >= 400:
            _meta_cache[url] = result
            return result

        final_url = normalize_url(r.url or url)

        if not r.encoding or r.encoding.lower() == "iso-8859-1":
            r.encoding = r.apparent_encoding or "utf-8"

        html = r.text or ""
        if not html:
            _meta_cache[url] = result
            return result

        soup = BeautifulSoup(html, "html.parser")

        title = clean_text(extract_page_title(soup) or "")
        thumbnail = extract_page_image(soup)
        content = extract_page_text(soup, final_url) or ""
        content = content.strip()
        
        if not title:
            _meta_cache[url] = result
            return result

        if not content or len(content) < MIN_CONTENT_LEN:
            _meta_cache[url] = result
            return result

        if not has_korean_article_signal(title, content):
            _meta_cache[url] = result
            return result

        result = {
            "title": title,
            "thumbnail": thumbnail if thumbnail and not is_bad_thumb(thumbnail) else None,
            "content": content,
            "is_korean": True,
            "final_url": final_url,
        }
        _meta_cache[url] = result
        return result

    except Exception as e:
        print("[crawler] fetch_page_meta error:", repr(e), "url=", url, flush=True)
        _meta_cache[url] = result
        return result

# -----------------------------
# Main Fetch Pipeline
# -----------------------------
=======
>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273
def fetch_news_items():
    start_kst, end_kst = get_recent_window()
    print(
        f"[crawler] recent window KST start={start_kst.strftime('%Y-%m-%d %H:%M:%S %Z')} "
        f"end={end_kst.strftime('%Y-%m-%d %H:%M:%S %Z')}",
        flush=True
    )

    raw_items = []

    for feed in RSS_FEEDS:
        items = fetch_rss_feed(feed)
        print(f"[crawler] rss fetched feed={feed['name']} category={feed['category']} items={len(items)}", flush=True)
        raw_items.extend(items)

    if not raw_items:
        print("[crawler] no rss items fetched", flush=True)
        return []

<<<<<<< HEAD
    dedup_by_url = {}
    for item in raw_items:
        url = normalize_url(item.get("url"))
        if not url or len(url) > MAX_URL_LEN:
=======
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
>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273
            continue
        if url not in dedup_by_url:
            dedup_by_url[url] = item

    raw_items = list(dedup_by_url.values())
    raw_items = [x for x in raw_items if is_recent_dt(x.get("published_at"))]
    raw_items = sort_items_latest(raw_items)

    if len(raw_items) > MAX_ITEMS_PER_RUN * 3:
        raw_items = raw_items[:MAX_ITEMS_PER_RUN * 3]

    print(f"[crawler] rss dedup recent raw_items={len(raw_items)}", flush=True)

    existing = fetch_existing_urls([normalize_url(x["url"]) for x in raw_items if x.get("url")])
    targets = [x for x in raw_items if normalize_url(x["url"]) not in existing]

    print(f"[crawler] enrich targets={len(targets)} existing={len(existing)}", flush=True)

    final_items = []
    final_seen = set()

    with ThreadPoolExecutor(max_workers=max(1, ARTICLE_FETCH_WORKERS)) as ex:
        future_map = {ex.submit(fetch_page_meta, item["url"]): item for item in targets}

        for fut in as_completed(future_map):
            item = future_map[fut]
            try:
                meta = fut.result()
            except Exception:
                continue

            if not meta.get("is_korean"):
                continue

            final_url = normalize_url(meta.get("final_url") or item["url"])
            if not final_url or final_url in final_seen:
                continue

            final_seen.add(final_url)

            title = clean_text(meta.get("title") or item.get("title") or "")
            content = clean_text(meta.get("content") or "")
            thumb = meta.get("thumbnail") or item.get("thumbnail")

            if not title or not content:
                continue
            if len(content) < MIN_CONTENT_LEN:
                continue
            if not has_korean_article_signal(title, content):
                continue

            final_items.append({
                "url": final_url,
                "title": title,
                "thumbnail": thumb,
                "content": content,
                "published_at": item.get("published_at"),
                "category": item.get("category") or "기타",
            })

            if len(final_items) >= MAX_ITEMS_PER_RUN:
                break

<<<<<<< HEAD
    final_items = sort_items_latest(final_items)
    print(f"[crawler] collected final korean items total={len(final_items)}", flush=True)
    return final_items
=======
        if len(all_raw_items) >= GDELT_MAX_ITEMS_PER_RUN:
            break

    print(
        f"[crawler] collected raw items total={len(all_raw_items)} from_files={used_file_count}",
        flush=True
    )

    if not all_raw_items:
        return []

    return enrich_items(all_raw_items, allow_domains)

>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273

# -----------------------------
# Insert
# -----------------------------
def upsert_articles(items: list[dict]):
    global last_items

    if not items:
        last_items = []
        return 0

    cleaned = []
    seen_in_batch = set()

    for it in items:
        url = normalize_url(it.get("url"))
        if not url or len(url) > MAX_URL_LEN:
            continue
        if url in seen_in_batch:
            continue
        seen_in_batch.add(url)

        title = clean_text(it.get("title", "") or "")
        content = clean_text(it.get("content") or "")
        thumb = it.get("thumbnail") or None

        if thumb and is_bad_thumb(thumb):
            thumb = None

        if not title:
            continue
        if not content or len(content) < MIN_CONTENT_LEN:
            continue
        if not has_korean_article_signal(title, content):
            continue

<<<<<<< HEAD
        pub_dt = parse_dt(it.get("published_at"))
=======
        thumb = it.get("thumbnail") or None
        if thumb and is_bad_thumb(thumb):
            thumb = None
        if not thumb:
            thumb = fetch_og_image(url)

        raw_dt = it.get("published_at")
        pub_dt = parse_dt(raw_dt)

>>>>>>> 23287ea197e6598a69eea4e07cc664415ef1b273
        if not pub_dt:
            continue
        if not is_recent_dt(pub_dt):
            continue

        category = clean_text(it.get("category") or "") or "기타"

        cleaned.append({
            "url": url,
            "title": title,
            "thumbnail": thumb,
            "content": content,
            "pub_dt": pub_dt,
            "raw_dt": it.get("published_at"),
            "category": category,
        })

    if not cleaned:
        last_items = []
        print("[crawler] cleaned items empty", flush=True)
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
                f"[crawler] insert done saved={saved} skipped_existing={len(existing)} batch_total={len(cleaned)}",
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

# -----------------------------
# Runner
# -----------------------------
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

        print("[crawler] inserting...", flush=True)
        saved = upsert_articles(items)
        print(f"[crawler] saved={saved}", flush=True)

    except Exception as e:
        print("[crawler] run_once error:", repr(e), flush=True)

    finally:
        release_db_lock()
        print("[crawler] db lock released", flush=True)
        _is_running = False

def crawler_loop():
    initial_delay = random.uniform(10, 30)
    print(f"[crawler] initial delay {initial_delay:.1f}s", flush=True)
    time.sleep(initial_delay)

    while True:
        try:
            run_once()
        except Exception as e:
            print("[crawler] loop error:", repr(e), flush=True)

        base = CRAWL_INTERVAL_SEC
        jitter = random.uniform(0, min(20, base * 0.05))
        time.sleep(base + jitter)

# -----------------------------
# FastAPI
# -----------------------------
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
