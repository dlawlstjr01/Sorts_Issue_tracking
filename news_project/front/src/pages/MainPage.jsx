import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS/main.css";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";

import { fetchNews } from "../api/newsApi";
import { rememberArticleDetail } from "../utils/articleDetail";
import { resolveThumbnailUrl, withImageFallback } from "../utils/imageUrl";

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "politics", label: "정치" },
  { key: "economy", label: "경제" },
  { key: "society", label: "사회" },
  { key: "world", label: "국제" },
  { key: "it", label: "IT/과학" },
  { key: "culture", label: "문화" },
  { key: "sports", label: "스포츠" },
];

const CATEGORY_ICON_PATHS = {
  all: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  politics:
    "M3 8l9-4 9 4v2H3V8zm2 3h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM3 20h18v2H3z",
  economy:
    "M3 7a2 2 0 0 1 2-2h14a1 1 0 0 1 1 1v2H5a1 1 0 0 0 0 2h16v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h2v-3h-2Z",
  society:
    "M9 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 0a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15 12ZM4 19a5 5 0 0 1 10 0v1H4Zm10 1v-1a4.5 4.5 0 0 0-1.1-3 4.8 4.8 0 0 1 7.1 4v0Z",
  world:
    "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.8 9h-3.1a15.5 15.5 0 0 0-1.1-5A8 8 0 0 1 19.8 11ZM12 4a13.6 13.6 0 0 1 2.7 7H9.3A13.6 13.6 0 0 1 12 4Zm-3.6 2a15.5 15.5 0 0 0-1.1 5H4.2A8 8 0 0 1 8.4 6ZM4.2 13h3.1a15.5 15.5 0 0 0 1.1 5A8 8 0 0 1 4.2 13ZM12 20a13.6 13.6 0 0 1-2.7-7h5.4A13.6 13.6 0 0 1 12 20Zm3.6-2a15.5 15.5 0 0 0 1.1-5h3.1a8 8 0 0 1-4.2 5Z",
  it: "M9 9h6v6H9zM3 10h3v2H3v-2zm15 0h3v2h-3v-2zM10 3h2v3h-2V3zm0 15h2v3h-2v-3zM5.5 5.5 7.6 7.6 6.2 9 4.1 6.9l1.4-1.4Zm12.4 12.4-2.1-2.1 1.4-1.4 2.1 2.1-1.4 1.4Zm0-11-2.1 2.1-1.4-1.4 2.1-2.1 1.4 1.4Zm-12.4 12.4 2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4Z",
  culture: "M14 4v10.2A3.5 3.5 0 1 1 12 11V6l8-2v8.2A3.5 3.5 0 1 1 18 9V4.8L14 6Z",
  sports: "M3 9h2v6H3V9Zm16 0h2v6h-2V9ZM6 7h2v10H6V7Zm10 0h2v10h-2V7ZM9 10h6v4H9v-4Z",
};

const OPPOSITE_CATEGORY_MAP = {
  politics: ["it", "culture", "sports"],
  economy: ["culture", "world", "sports"],
  society: ["economy", "it", "sports"],
  world: ["politics", "culture", "sports"],
  it: ["politics", "society", "world"],
  culture: ["economy", "politics", "it"],
  sports: ["politics", "economy", "world"],
};

const UQ = "?auto=format&fit=crop&w=1200&q=80";
const THUMB = {
  it: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
  economy: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
  society: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620",
  world: "https://images.unsplash.com/photo-1502920917128-1aa500764b4c",
  culture: "https://images.unsplash.com/photo-1507924538820-ede94a04019d",
  sports: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
};

const INITIAL_ARTICLES = [];

function getCategoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || "기타";
}

function Badge({ type }) {
  const isHot = String(type).toUpperCase() === "HOT";
  return (
    <span className={`mp-badge ${isHot ? "hot" : "new"}`}>
      {isHot ? "🔥 HOT" : "🆕 최신"}
    </span>
  );
}

function CategoryIcon({ categoryKey }) {
  const path = CATEGORY_ICON_PATHS[categoryKey] || CATEGORY_ICON_PATHS.all;
  return (
    <span className="mp-cat-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d={path} fill="currentColor" />
      </svg>
    </span>
  );
}

function CategoryButton({ label, categoryKey, active, onClick }) {
  return (
    <button
      type="button"
      className={`mp-cat-btn ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <CategoryIcon categoryKey={categoryKey} />
      {label}
    </button>
  );
}

function RelatedItem({ title, meta, onClick }) {
  return (
    <button type="button" className="mp-related-item" onClick={onClick}>
      <div className="mp-related-title">{title}</div>
      <div className="mp-related-meta">{meta}</div>
    </button>
  );
}

function LatestIssueCard({ issue, onClick }) {
  const titles =
    issue.related_articles?.length > 0
      ? issue.related_articles.map((article) => article.title)
      : [issue.title];

  return (
    <button type="button" className="mp-latest-card" onClick={onClick}>
      <div className="mp-latest-title">
        {titles.map((title, idx) => (
          <div key={idx}>{title}</div>
        ))}
      </div>
    </button>
  );
}

function LatestIssuesCarousel({ items, count, onItemClick }) {
  const trackRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    rafId: 0,
    targetScrollLeft: 0,
    pointerId: null,
    moveRafId: 0,
  });

  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    if (e.button !== undefined && e.button !== 0) return;

    if (dragRef.current.rafId) cancelAnimationFrame(dragRef.current.rafId);

    dragRef.current.pointerId = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { }

    dragRef.current.active = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startScrollLeft = el.scrollLeft;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastTime = performance.now();
    dragRef.current.velocity = 0;
    dragRef.current.targetScrollLeft = el.scrollLeft;

    el.classList.add("is-dragging");
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    const el = trackRef.current;
    if (!el || !dragRef.current.active) return;

    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.targetScrollLeft = dragRef.current.startScrollLeft - dx;

    const now = performance.now();
    const dt = now - dragRef.current.lastTime;
    if (dt > 0) {
      const dist = e.clientX - dragRef.current.lastX;
      dragRef.current.velocity = dist / dt;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastTime = now;
    }

    if (!dragRef.current.moveRafId) {
      dragRef.current.moveRafId = requestAnimationFrame(() => {
        if (!dragRef.current.active) {
          dragRef.current.moveRafId = 0;
          return;
        }
        el.scrollLeft = dragRef.current.targetScrollLeft;
        dragRef.current.moveRafId = 0;
      });
    }

    e.preventDefault();
  };

  const stopDrag = () => {
    const el = trackRef.current;
    if (!el) return;

    dragRef.current.active = false;
    el.classList.remove("is-dragging");

    if (dragRef.current.moveRafId) cancelAnimationFrame(dragRef.current.moveRafId);
    dragRef.current.moveRafId = 0;

    try {
      if (dragRef.current.pointerId !== null) {
        el.releasePointerCapture(dragRef.current.pointerId);
      }
    } catch { }
    dragRef.current.pointerId = null;

    const startVelocity = dragRef.current.velocity;
    if (Math.abs(startVelocity) < 0.02) return;

    const step = () => {
      const v = dragRef.current.velocity * 0.95;
      dragRef.current.velocity = v;
      el.scrollLeft -= v * 16;
      if (Math.abs(v) > 0.02) dragRef.current.rafId = requestAnimationFrame(step);
      else dragRef.current.rafId = 0;
    };

    dragRef.current.rafId = requestAnimationFrame(step);
  };

  return (
    <section className="mp-latest">
      <div className="mp-latest-head">
        <div className="mp-section-title">묶인 기사 ({count || 0})</div>
        <div className="mp-latest-ctrl">
          <button
            type="button"
            className="mp-latest-btn"
            onClick={() => scrollByAmount(-1)}
            aria-label="latest left"
          >
            ◀
          </button>
          <button
            type="button"
            className="mp-latest-btn"
            onClick={() => scrollByAmount(1)}
            aria-label="latest right"
          >
            ▶
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 12, opacity: 0.7 }}>묶인 기사가 없습니다.</div>
      ) : (
        <div
          className="mp-latest-track"
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
          onPointerCancel={stopDrag}
        >
          {items.map((issue) => (
            <LatestIssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onItemClick(issue)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function mapTrackingItemToRelatedUI(it) {
  const title = it?.title || it?.issue_title || it?.headline || "(제목 없음)";
  const url = it?.url || it?.representative_url || it?.top_url || "";
  const summary =
    it?.summary || it?.ultra_short || it?.issue_summary || it?.description || "";
  const id = String(it?.id || it?.issue_id || url || title);

  const inferredCategory = inferCategoryFromNews({
    title,
    summary,
    description: summary,
    content: it?.background || it?.content || "",
    body: it?.body || "",
    press_name: it?.press_name || "",
  });

  return {
    id,
    category: inferredCategory,
    title,
    meta: summary,
    raw: { ...it, url },
  };
}

function mapIssueSummaryToLatestUI(it, articles = []) {
  const matchedArticle = articles.find(
    (a) => String(a.id) === String(it.article_id)
  );

  const inferredCategory =
    matchedArticle?.category ||
    inferCategoryFromNews({
      title: it.title,
      summary: it.summary,
      description: it.short_summary,
      content: it.background,
    });

  return {
    id: String(it.id),
    articleId: String(it.article_id || it.id),
    category: inferredCategory,
    title: it.title || "(이슈 제목 없음)",
    relatedCount: Number(it.related_count || 0),
    articleIds: Array.isArray(it.article_ids) ? it.article_ids.map(String) : [],
    summary: it.summary || "",
    shortSummary: it.short_summary || "",
    ultraShort: it.ultra_short || "",
    createdAt: it.created_at ? new Date(it.created_at).getTime() : Date.now(),
    representativeUrl: it.url || "",
    raw: it,
  };
}

const CATEGORY_RULES = {
  politics: ["국회", "대통령", "총리", "정당", "선거", "공천", "탄핵", "외교", "정부", "장관", "의원", "정책", "국정"],
  economy: [
    "금리",
    "물가",
    "환율",
    "주가",
    "증시",
    "코스피",
    "코스닥",
    "비트코인",
    "가상자산",
    "부동산",
    "경제",
    "경기",
    "실적",
    "매출",
    "영업이익",
    "투자",
    "수출",
    "수입",
    "고용",
    "실업",
    "인플레이션",
  ],
  society: [
    "사건",
    "사고",
    "범죄",
    "경찰",
    "검찰",
    "법원",
    "재판",
    "구속",
    "화재",
    "붕괴",
    "실종",
    "폭행",
    "사망",
    "노동",
    "파업",
    "교육",
    "학교",
    "복지",
    "의료",
    "질병",
  ],
  world: ["미국", "중국", "일본", "러시아", "우크라이나", "유럽", "EU", "UN", "이스라엘", "가자", "중동", "나토", "해외", "국제", "외신", "정상회담", "관세"],
  it: [
    "AI",
    "인공지능",
    "챗GPT",
    "오픈AI",
    "구글",
    "애플",
    "메타",
    "MS",
    "마이크로소프트",
    "엔비디아",
    "반도체",
    "스마트폰",
    "보안",
    "해킹",
    "클라우드",
    "데이터",
    "서버",
    "알고리즘",
    "로봇",
    "과학",
    "우주",
  ],
  culture: ["영화", "드라마", "OTT", "넷플릭스", "디즈니", "음악", "가수", "아이돌", "공연", "전시", "미술", "문학", "문화", "축제", "패션", "연예", "방송"],
  sports: ["축구", "야구", "농구", "배구", "골프", "테니스", "UFC", "EPL", "K리그", "MLB", "NBA", "KBO", "올림픽", "월드컵", "선수", "감독", "경기", "득점"],
};

function normalizeText(s) {
  return String(s || "").toLowerCase();
}

function inferCategoryFromNews(n) {
  const text = normalizeText(
    [n.title, n.description, n.summary, n.content, n.body, n.press_name]
      .filter(Boolean)
      .join(" ")
  );
  if (!text) return "society";

  let bestKey = "society";
  let bestScore = 0;

  for (const [key, keywords] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(String(kw).toLowerCase())) score += 1;
    }
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  }
  return bestScore > 0 ? bestKey : "society";
}

function mapNewsToArticle(n) {
  const rawId = n.id ?? `${n.url || "news"}-${n.published_at || Date.now()}`;
  const id = String(rawId);

  const category = inferCategoryFromNews(n);
  const title = n.title ?? "(제목 없음)";
  const fallbackThumb = `${THUMB[category] || THUMB.it}${UQ}`;
  const thumb = resolveThumbnailUrl(n.thumbnail, fallbackThumb);
  const rawTime = n.published_at ?? n.created_at;
  const createdAt = rawTime ? new Date(rawTime).getTime() : Date.now();

  return {
    id,
    category,
    badge: "최신",
    title,
    thumbnailUrl: thumb,
    summary: [
      n.summary ||
      n.short_summary ||
      n.ultra_short ||
      "요약 정보가 없습니다. 본문 보기로 원문을 확인하세요.",
    ],
    createdAt,
    raw: n,
  };
}

function buildArticleDedupKey(article) {
  const title = String(article?.title || "").trim();
  const published = String(
    article?.raw?.published_at ||
    article?.raw?.created_at ||
    article?.published_at ||
    article?.createdAt ||
    ""
  ).trim();

  if (title && published) return `title:${title}|published:${published}`;

  const url = String(article?.raw?.url || article?.url || "").trim();
  if (url) return `url:${url}`;

  if (title || published) return `title:${title}|published:${published}`;
  return `id:${String(article?.id || "")}`;
}

function pickPreferredArticle(current, incoming) {
  if (!current) return incoming;

  const currentTs = Number(current?.createdAt || 0);
  const incomingTs = Number(incoming?.createdAt || 0);
  if (incomingTs > currentTs) return incoming;
  if (incomingTs < currentTs) return current;

  const currentId = Number(current?.id);
  const incomingId = Number(incoming?.id);
  if (Number.isFinite(currentId) && Number.isFinite(incomingId)) {
    return incomingId >= currentId ? incoming : current;
  }

  return incoming;
}

function mergeUniqueArticles(items) {
  const dedup = new Map();
  for (const item of items) {
    const key = buildArticleDedupKey(item);
    const current = dedup.get(key);
    dedup.set(key, pickPreferredArticle(current, item));
  }

  return Array.from(dedup.values()).sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );
}

function mapRecoItemToArticle(item) {
  const raw = item?.raw ?? item ?? {};
  const url = raw.url || raw.link || raw.news_url || "";
  const title = raw.title || raw.headline || "(제목 없음)";

  const rawCategory = String(raw.category || "").trim().toLowerCase();

  const category =
    rawCategory &&
      rawCategory !== "기타" &&
      rawCategory !== "etc" &&
      rawCategory !== "all"
      ? raw.category
      : inferCategoryFromNews({
        title,
        summary: raw.summary || raw.short_summary || raw.ultra_short || "",
        description: raw.description || "",
        content: raw.content || raw.background || "",
        body: raw.body || "",
        press_name: raw.press_name || "",
      });

  const id =
    raw.id ??
    raw.articleId ??
    raw.news_id ??
    url ??
    `${title}-${raw.published_at || raw.publishedAt || Date.now()}`;

  const createdAt =
    raw.published_at || raw.publishedAt
      ? new Date(raw.published_at || raw.publishedAt).getTime()
      : Date.now();

  const fallbackThumb = `${THUMB[category] || THUMB.it}${UQ}`;

  return {
    id: String(id),
    category,
    badge: "추천",
    title,
    thumbnailUrl: resolveThumbnailUrl(raw.thumbnail, fallbackThumb),
    summary: ["추천 기사입니다. 상세는 본문에서 확인하세요."],
    createdAt,
    raw: { ...raw, url },
  };
}

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [recoItems, setRecoItems] = useState([]);
  const [latestIssues, setLatestIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [manualSelectedArticle, setManualSelectedArticle] = useState(null);
  const [articleListMode, setArticleListMode] = useState("daily");
  const swiperRef = useRef(null);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoReady, setRecoReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const size = 100;

  const cacheRef = useRef(new Map());
  const fetchedPagesRef = useRef(new Set());
  const abortRef = useRef(null);

  const MIN_PER_CATEGORY = 15;
  const MAX_AUTO_PAGES = 6;

  const q = "";

  const fetchPageAndAppend = async (targetPage, { background = false } = {}) => {
    const cacheKey = `${targetPage}:${size}:${q}`;

    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setArticles((prev) => {
        return mergeUniqueArticles([...prev, ...cached]);
      });
      setPage((prev) => Math.max(prev, targetPage));
      return cached.length;
    }

    if (fetchedPagesRef.current.has(cacheKey)) return 0;
    fetchedPagesRef.current.add(cacheKey);

    const controller = new AbortController();
    if (!background) {
      abortRef.current = controller;
    }

    try {
      if (!background) {
        setLoading(true);
        setError("");
      }

      const res = await fetchNews(
        { page: targetPage, size, q, includeTotal: false },
        { signal: controller.signal }
      );
      const data = res.data;
      const list = Array.isArray(data?.items) ? data.items : [];
      const mapped = list.map(mapNewsToArticle);

      cacheRef.current.set(cacheKey, mapped);

      setArticles((prev) => {
        return mergeUniqueArticles([...prev, ...mapped]);
      });
      setPage((prev) => Math.max(prev, targetPage));

      return mapped.length;
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") {
        fetchedPagesRef.current.delete(cacheKey);
        return 0;
      }

      fetchedPagesRef.current.delete(cacheKey);
      if (!background) {
        setError(e?.response?.data?.message || "뉴스를 불러오지 못했습니다.");
      }
      return 0;
    } finally {
      if (!background) {
        setLoading(false);
        if (abortRef.current === controller) abortRef.current = null;
      }
    }
  };

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        setUserId(res.data?.id ?? null);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          setUserId(null);
          return;
        }
        console.error("[auth/me] failed:", e);
        setUserId(null);
      }
    };
    loadMe();
  }, []);

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const loadInitial = async () => {
      const loaded = await fetchPageAndAppend(1);
      if (!loaded) return;

      void (async () => {
        await fetchPageAndAppend(2, { background: true });
        await fetchPageAndAppend(3, { background: true });
      })();
    };

    loadInitial();
  }, []);

  const skipAbortFirstRunRef = useRef(true);
  useEffect(() => {
    if (skipAbortFirstRunRef.current) {
      skipAbortFirstRunRef.current = false;
      return;
    }
    if (abortRef.current) abortRef.current.abort();
  }, [selectedCategory]);

  useEffect(() => {
    let canceled = false;

    const ensureCategoryFilled = async () => {
      if (selectedCategory === "all") return;

      const countNow = articles.filter((a) => a.category === selectedCategory).length;
      if (countNow >= MIN_PER_CATEGORY) return;

      let nextPage = page;
      let tries = 0;

      while (!canceled && tries < MAX_AUTO_PAGES) {
        tries += 1;
        nextPage += 1;

        const added = await fetchPageAndAppend(nextPage);
        setPage(nextPage);

        if (added === 0) break;
      }
    };

    ensureCategoryFilled();

    return () => {
      canceled = true;
    };
  }, [selectedCategory, articles, page]);

  useEffect(() => {
    if (!userId) {
      setRecoItems([]);
      setRecoLoading(false);
      setRecoReady(false);
      return;
    }

    let isMounted = true;
    let timeoutId = null;
    let retryCount = 0;
    const MAX_RETRY = 3;

    const loadReco = async () => {
      try {
        if (!isMounted) return;

        setRecoLoading(true);

        const res = await axios.get("/reco", {
          params: { k: 20, userId }
        });

        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
            ? res.data
            : [];

        const mapped = items.map(mapRecoItemToArticle);

        if (!isMounted) return;

        // 추천 결과가 있으면 바로 렌더링
        if (mapped.length > 0) {
          setRecoItems(mapped);
          setRecoLoading(false);
          setRecoReady(true);
          return;
        }

        // 비어있으면 재시도
        if (retryCount < MAX_RETRY) {
          retryCount += 1;
          timeoutId = setTimeout(() => {
            loadReco();
          }, 20000);
          return;
        }

        // 끝까지 비어있으면 로딩 종료
        setRecoItems([]);
        setRecoLoading(false);
        setRecoReady(true);

      } catch (err) {
        console.error("추천 불러오기 실패", err);

        if (!isMounted) return;

        setRecoItems([]);
        setRecoLoading(false);
        setRecoReady(true);
      }
    };

    setRecoItems([]);
    setRecoReady(false);
    loadReco();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId]);

  useEffect(() => {
    const loadLatestIssues = async () => {
      try {
        const res = await axios.get("/tracking/issues", {
          params: { limit: 15 },
        });

        const items = res.data?.items || res.data?.issues || res.data?.data || [];
        const mapped = items.map((it) => mapIssueSummaryToLatestUI(it, articles));
        setLatestIssues(mapped);
      } catch (e) {
        console.error("latest issues load failed:", e);
        setLatestIssues([]);
      }
    };

    loadLatestIssues();
  }, [articles]);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [selectedCategory, articles]);

  const articleLists = useMemo(() => {
    const daily = [...filtered].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const sevenDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const weeklySource = daily.filter((a) => (a.createdAt || 0) >= sevenDaysAgo);
    const weeklyBase = weeklySource.length ? weeklySource : daily;

    const weekly = [...weeklyBase].sort((a, b) => {
      const hotA = String(a.badge).toUpperCase() === "HOT" ? 1 : 0;
      const hotB = String(b.badge).toUpperCase() === "HOT" ? 1 : 0;
      if (hotA !== hotB) return hotB - hotA;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return { daily, weekly };
  }, [filtered]);

  const displayedArticles =
    articleListMode === "weekly" ? articleLists.weekly : articleLists.daily;

  const centerArticles = useMemo(() => {
    if (manualSelectedArticle) return [manualSelectedArticle];
    return displayedArticles;
  }, [manualSelectedArticle, displayedArticles]);

  const selectedArticle = useMemo(() => {
    if (manualSelectedArticle) return manualSelectedArticle;
    if (!displayedArticles.length) return null;
    const fromDisplayed = displayedArticles.find(
      (a) => String(a.id) === String(selectedId)
    );
    return fromDisplayed || displayedArticles[0];
  }, [displayedArticles, selectedId, manualSelectedArticle]);

  const listActiveId = manualSelectedArticle ? selectedId : selectedArticle?.id;

  useEffect(() => {
    const loadSelectedIssue = async () => {
      if (!selectedArticle?.id) {
        setSelectedIssue(null);
        return;
      }

      try {
        const res = await axios.get("/tracking/issues", {
          params: {
            article_id: selectedArticle.id,
            limit: 1,
          },
        });

        const items = res.data?.items || res.data?.issues || res.data?.data || [];
        const first = items[0] || null;

        setSelectedIssue(first ? mapIssueSummaryToLatestUI(first, articles) : null);
      } catch (e) {
        console.error("selected issue load failed:", e);
        setSelectedIssue(null);
      }
    };

    loadSelectedIssue();
  }, [selectedArticle?.id, articles]);

  const selectedIssueGroup = useMemo(() => {
    const ids =
      selectedIssue?.articleIds ||
      selectedIssue?.raw?.article_ids ||
      [];

    if (!ids.length) return [];

    const articleMap = new Map(
      articles.map((a) => [String(a.id), a])
    );

    return ids
      .map((id) => articleMap.get(String(id)))
      .filter(Boolean)
      .map((a) => ({
        id: String(a.id),
        title: a.title || "(제목 없음)",
        url: a.raw?.url || "",
        category: a.category || "society",
        createdAt: a.createdAt || Date.now(),
        relatedCount: 0,
      }));
  }, [selectedIssue, articles]);

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return articles
      .filter((a) => String(a.id) !== String(selectedArticle.id))
      .slice(0, 6);
  }, [selectedArticle, articles]);

  const contrastArticles = useMemo(() => {
    if (!selectedArticle) return [];

    const source = articles.filter((a) => String(a.id) !== String(selectedArticle.id));
    const oppositeCategories = OPPOSITE_CATEGORY_MAP[selectedArticle.category] || [];
    const allCategories = CATEGORIES.map((c) => c.key).filter((k) => k !== "all");
    const fallbackCategories = allCategories.filter(
      (k) => k !== selectedArticle.category && !oppositeCategories.includes(k)
    );

    const primary = source.filter((a) => oppositeCategories.includes(a.category));
    const secondary = source.filter((a) => fallbackCategories.includes(a.category));
    const tail = source.filter(
      (a) =>
        !oppositeCategories.includes(a.category) &&
        !fallbackCategories.includes(a.category)
    );

    return [...primary, ...secondary, ...tail].slice(0, 6);
  }, [selectedArticle, articles]);

  const [trackRelated, setTrackRelated] = useState([]);

  useEffect(() => {
    const loadTrackingRelated = async () => {
      try {
        const res = await axios.get("/tracking/issues", {
          params: { limit: 6 },
        });

        const items = res.data?.items || res.data?.issues || res.data?.data || [];
        const mapped = items.map(mapTrackingItemToRelatedUI);
        setTrackRelated(mapped);
      } catch (e) {
        console.error("tracking related load failed:", e);
        setTrackRelated([]);
      }
    };

    loadTrackingRelated();
  }, [selectedId]);

  const relatedRecoItems = trackRelated;
  const contrastRecoItems = [];

  const onSaveArticle = (article) => {
    console.log("save article:", article);
  };

  useEffect(() => {
    if (!displayedArticles.length) {
      setSelectedId(null);
      return;
    }

    const exists =
      selectedId != null &&
      displayedArticles.some((a) => String(a.id) === String(selectedId));

    if (!exists) {
      setSelectedId(String(displayedArticles[0].id));
      if (swiperRef.current) swiperRef.current.slideTo(0, 0);
    }
  }, [displayedArticles, selectedCategory, articleListMode, selectedId]);

  useEffect(() => {
    if (!swiperRef.current) return;
    const idx = displayedArticles.findIndex((a) => String(a.id) === String(selectedId));
    if (idx >= 0 && swiperRef.current.activeIndex !== idx) {
      swiperRef.current.slideTo(idx, 0);
    }
  }, [displayedArticles, selectedId]);

  const openOriginal = (article) => {
    const merged =
      article?.raw && typeof article.raw === "object"
        ? { ...article.raw, ...article }
        : article;
    const normalized = rememberArticleDetail(merged);
    if (!normalized) {
      alert("기사 정보를 확인할 수 없습니다.");
      return;
    }

    navigate(`/?view=article&id=${encodeURIComponent(normalized.id)}`, {
      state: {
        article: normalized,
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <div className="mp-wrap">
      <div className="mp-grid">
        <aside className="mp-left">
          <div className="mp-panel">
            <div className="mp-panel-title">카테고리</div>
            <div className="mp-cat-list">
              {CATEGORIES.map((c) => (
                  <CategoryButton
                    key={c.key}
                    label={c.label}
                    categoryKey={c.key}
                    active={selectedCategory === c.key}
                    onClick={() => {
                      setManualSelectedArticle(null);
                      setSelectedCategory(c.key);
                      setSelectedId(null);
                      if (swiperRef.current) swiperRef.current.slideTo(0, 0);
                    }}
                  />
              ))}
            </div>

            <div className="mp-divider" />

            <div className="mp-article-shell">
              <div className="mp-article-head">
                <div className="mp-article-tabs" role="tablist" aria-label="기사 목록 모드">
                  <button
                    type="button"
                    className={`mp-article-tab ${articleListMode === "daily" ? "active" : ""}`}
                    onClick={() => {
                      setManualSelectedArticle(null);
                      setArticleListMode("daily");
                    }}
                    aria-pressed={articleListMode === "daily"}
                  >
                    일간
                  </button>
                  <button
                    type="button"
                    className={`mp-article-tab ${articleListMode === "weekly" ? "active" : ""}`}
                    onClick={() => {
                      setManualSelectedArticle(null);
                      setArticleListMode("weekly");
                    }}
                    aria-pressed={articleListMode === "weekly"}
                  >
                    주간
                  </button>
                </div>
              </div>

              <div className="mp-article-list">
                {displayedArticles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`mp-article-item ${
                      listActiveId != null && String(a.id) === String(listActiveId) ? "active" : ""
                    }`}
                    onClick={() => {
                      setManualSelectedArticle(null);
                      setSelectedId(String(a.id));
                    }}
                  >
                    <div className="mp-article-item-top">
                      <span className="mp-article-item-cat">{getCategoryLabel(a.category)}</span>
                      <span
                        className={`mp-article-item-badge ${String(a.badge).trim().toUpperCase() === "HOT" ? "hot" : "new"}`}
                      >
                        {a.badge}
                      </span>
                    </div>
                    <div className="mp-article-item-title">{a.title}</div>
                  </button>
                ))}

                {!loading && displayedArticles.length === 0 && (
                  <div style={{ padding: 12, opacity: 0.7 }}>해당 카테고리 기사가 없습니다.</div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: 12 }}>
                <button
                  type="button"
                  className="mp-btn"
                  disabled={loading}
                  onClick={async () => {
                    const next = page + 1;
                    await fetchPageAndAppend(next);
                    setPage(next);
                  }}
                >
                  {loading ? "불러오는 중..." : "더 불러오기"}
                </button>
              </div>

              {error && (
                <div style={{ padding: "0 12px 12px", color: "#ff6b6b", fontSize: 13 }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="mp-center">
          {!selectedArticle ? (
            <div style={{ padding: 20, opacity: 0.8 }}>
              {loading ? "불러오는 중..." : "표시할 기사가 없습니다."}
            </div>
          ) : (
            <Swiper
              key={
                manualSelectedArticle
                  ? `manual-${manualSelectedArticle.id}`
                  : `${selectedCategory}-${articleListMode}`
              }
              direction="vertical"
              slidesPerView={1}
              mousewheel={{ forceToAxis: true, releaseOnEdges: false }}
              speed={600}
              modules={[Mousewheel]}
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              onSlideChange={(s) => {
                const next = centerArticles[s.activeIndex];
                if (!next || manualSelectedArticle) return;
                setSelectedId(String(next.id));
              }}
              className="mp-center-swiper"
            >
              {centerArticles.map((article) => (
                <SwiperSlide key={article.id}>
                  <div className="mp-center-inner">
                    <div className="mp-head">
                      <h1 className="mp-title">{article.title}</h1>
                      <Badge type={article.badge} />
                    </div>

                    <div className="mp-thumb-wrap">
                      <img
                        className="mp-thumb"
                        src={article.thumbnailUrl}
                        alt="article thumbnail"
                        loading="lazy"
                        onError={withImageFallback}
                      />
                      <div className="mp-thumb-label">AI 생성 썸네일</div>
                    </div>

                    <section className="mp-summary">
                      <div className="mp-section-title">요약</div>

                      <div className="mp-summary-lines">
                        <p className="mp-summary-line">
                          {selectedIssue?.ultraShort ||
                            selectedIssue?.shortSummary ||
                            article.summary?.[0] ||
                            "요약 정보가 없습니다. 본문 보기로 원문을 확인하세요."}
                        </p>
                      </div>

                      <div className="mp-actions">
                        <button
                          className="mp-btn primary"
                          type="button"
                          onClick={() => openOriginal(article)}
                        >
                          본문 보기
                        </button>

                        <button
                          className="mp-btn"
                          type="button"
                          onClick={() => onSaveArticle(article)}
                        >
                          저장
                        </button>

                        <button className="mp-btn" type="button">
                          공유
                        </button>
                      </div>
                    </section>

                    <LatestIssuesCarousel
                      items={selectedIssueGroup}
                      count={selectedIssue?.relatedCount || 0}
                      onItemClick={(issue) => {
                        if (issue.url) {
                          window.open(issue.url, "_blank", "noopener,noreferrer");
                        }
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </main>

        <aside className="mp-right">
          <div className="mp-panel">
            <div className="mp-panel-title">추천 기사</div>
            <div className="mp-related-list">
              {!userId ? (
                <div style={{ padding: 10, opacity: 0.7 }}>
                  로그인하면 개인화 추천(자주 본 뉴스)이 표시됩니다.
                </div>
              ) : recoLoading && !recoReady ? (
                <div style={{ padding: 10, opacity: 0.7 }}>
                  추천 기사 불러오는 중...
                </div>
              ) : recoItems.length > 0 ? (
                recoItems.map((a) => (
                  <RelatedItem
                    key={a.id}
                    title={a.title}
                    meta={`${getCategoryLabel(a.category)} · 관련`}
                    onClick={() => {
                      openOriginal(a);
                    }}
                  />
                ))
              ) : relatedRecoItems.length > 0 ? (
                relatedRecoItems.map((a) => (
                  <RelatedItem
                    key={a.id}
                    title={a.title}
                    meta={`${getCategoryLabel(a.category)} · 관련`}
                    onClick={() => {
                      openOriginal(a);
                    }}
                  />
                ))
              ) : (
                <div style={{ padding: 10, opacity: 0.7 }}>
                  추천 데이터가 없습니다.
                </div>
              )}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">반대 관점 기사</div>
            <div className="mp-related-list">
              {(contrastRecoItems.length ? contrastRecoItems : contrastArticles).map((a) => (
                <RelatedItem
                  key={`contrast-${a.id}`}
                  title={a.title}
                  meta={`${getCategoryLabel(a.category)} · 대조`}
                  onClick={() => {
                    openOriginal(a);
                  }}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
