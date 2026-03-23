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
MIN_CONTENT_LEN = int(os.getenv("MIN_CONTENT_LEN", "120"))
ARTICLE_FETCH_WORKERS = int(os.getenv("ARTICLE_FETCH_WORKERS", "10"))
RECENT_DAYS_INCLUDING_TODAY = int(os.getenv("RECENT_DAYS_INCLUDING_TODAY", "3"))
DB_LOCK_NAME = os.getenv("DB_LOCK_NAME", "news_project_crawler_lock")
MAX_ITEMS_PER_RUN = int(os.getenv("MAX_ITEMS_PER_RUN", "200"))

FETCH_ARTICLE_TEXT_MAXLEN = int(os.getenv("FETCH_ARTICLE_TEXT_MAXLEN", "8000"))

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

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = str(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

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

# -----------------------------
# Existing URL Check
# -----------------------------
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
        root = ET.fromstring(feed_xml)
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

            if not link or not title:
                continue

            items.append({
                "url": link,
                "title": title,
                "thumbnail": thumb if thumb and not is_bad_thumb(thumb) else None,
                "content": desc or None,
                "published_at": pub_date,
                "category": category or "기타",
            })

    return items

def fetch_rss_feed(feed_info: dict) -> list[dict]:
    url = feed_info["url"]
    category = feed_info.get("category") or "기타"

    try:
        r = _session.get(url, timeout=(8, 20), allow_redirects=True)
        if r.status_code >= 400:
            print(f"[crawler] rss http error status={r.status_code} url={url}", flush=True)
            return []

        if not r.encoding or r.encoding.lower() == "iso-8859-1":
            r.encoding = r.apparent_encoding or "utf-8"

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

    dedup_by_url = {}
    for item in raw_items:
        url = normalize_url(item.get("url"))
        if not url or len(url) > MAX_URL_LEN:
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

    final_items = sort_items_latest(final_items)
    print(f"[crawler] collected final korean items total={len(final_items)}", flush=True)
    return final_items

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

        pub_dt = parse_dt(it.get("published_at"))
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
