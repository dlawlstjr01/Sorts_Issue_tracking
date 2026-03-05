import React, { useEffect, useMemo, useRef, useState } from "react";
import "../CSS/main.css";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";

import { fetchNews } from "../api/newsApi";

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
  politics: "M3 8l9-4 9 4v2H3V8zm2 3h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM3 20h18v2H3z",
  economy: "M3 7a2 2 0 0 1 2-2h14a1 1 0 0 1 1 1v2H5a1 1 0 0 0 0 2h16v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h2v-3h-2Z",
  society: "M9 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 0a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15 12ZM4 19a5 5 0 0 1 10 0v1H4Zm10 1v-1a4.5 4.5 0 0 0-1.1-3 4.8 4.8 0 0 1 7.1 4v0Z",
  world: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.8 9h-3.1a15.5 15.5 0 0 0-1.1-5A8 8 0 0 1 19.8 11ZM12 4a13.6 13.6 0 0 1 2.7 7H9.3A13.6 13.6 0 0 1 12 4Zm-3.6 2a15.5 15.5 0 0 0-1.1 5H4.2A8 8 0 0 1 8.4 6ZM4.2 13h3.1a15.5 15.5 0 0 0 1.1 5A8 8 0 0 1 4.2 13ZM12 20a13.6 13.6 0 0 1-2.7-7h5.4A13.6 13.6 0 0 1 12 20Zm3.6-2a15.5 15.5 0 0 0 1.1-5h3.1a8 8 0 0 1-4.2 5Z",
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

/**  긴 URL 줄이기(채팅/VSCode에서 "오른쪽 잘림" 체감 줄이기) */
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

const INITIAL_ARTICLES = [
  {
    id: 1,
    category: "it",
    badge: "HOT",
    title: "생성형 AI 경쟁 심화로 모델 성능·비용 최적화 관련",
    thumbnailUrl: `${THUMB.it}${UQ}`,
    summary: [
      "글로벌 기업들이 생성형 AI 모델 고도화 경쟁을 벌이고 있습니다.",
      "성능 향상과 운영 비용 최적화가 핵심 이슈로 떠올랐습니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 20,
    raw: { url: "" },
  },
];

function getCategoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || "기타";
}

function formatRelativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "방금";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  return `${day}일 전`;
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

function LatestCard({ article, onClick }) {
  return (
    <button type="button" className="mp-latest-card" onClick={onClick}>
      <div className="mp-latest-top">
        <span className="mp-latest-cat">{getCategoryLabel(article.category)}</span>
        <span className="mp-latest-time">{formatRelativeTime(article.createdAt)}</span>
      </div>
      <div className="mp-latest-title">{article.title}</div>
    </button>
  );
}

function LatestCarousel({ items, onItemClick }) {
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
    } catch {}

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
      if (dragRef.current.pointerId !== null)
        el.releasePointerCapture(dragRef.current.pointerId);
    } catch {}
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
        <div className="mp-section-title">최신 기사</div>
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

      <div
        className="mp-latest-track"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
        onPointerCancel={stopDrag}
      >
        {items.map((a) => (
          <LatestCard key={a.id} article={a} onClick={() => onItemClick(a)} />
        ))}
      </div>
    </section>
  );
}

/** ----------------- 카테고리 자동 분류 ----------------- */

const CATEGORY_RULES = {
  politics: [
    "국회",
    "대통령",
    "총리",
    "정당",
    "선거",
    "공천",
    "탄핵",
    "외교",
    "정부",
    "장관",
    "의원",
    "정책",
    "국정",
  ],
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
  world: [
    "미국",
    "중국",
    "일본",
    "러시아",
    "우크라이나",
    "유럽",
    "EU",
    "UN",
    "이스라엘",
    "가자",
    "중동",
    "나토",
    "해외",
    "국제",
    "외신",
    "정상회담",
    "관세",
  ],
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
  culture: [
    "영화",
    "드라마",
    "OTT",
    "넷플릭스",
    "디즈니",
    "음악",
    "가수",
    "아이돌",
    "공연",
    "전시",
    "미술",
    "문학",
    "문화",
    "축제",
    "패션",
    "연예",
    "방송",
  ],
  sports: [
    "축구",
    "야구",
    "농구",
    "배구",
    "골프",
    "테니스",
    "UFC",
    "EPL",
    "K리그",
    "MLB",
    "NBA",
    "KBO",
    "올림픽",
    "월드컵",
    "선수",
    "감독",
    "경기",
    "득점",
  ],
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
  const thumb = n.thumbnail ? n.thumbnail : `${(THUMB[category] || THUMB.it)}${UQ}`;
  const rawTime = n.published_at ?? n.created_at;
  const createdAt = rawTime ? new Date(rawTime).getTime() : Date.now();

  return {
    id,
    category,
    badge: "최신",
    title,
    thumbnailUrl: thumb,
    summary: ["요약은 상세 페이지에서 확인할 수 있습니다."],
    createdAt,
    raw: n,
  };
}
/**  reco items를 UI article 형태로 안전 변환 */
function mapRecoItemToArticle(item) {
  const raw = item?.raw ?? item ?? {};
  const url = raw.url || raw.link || raw.news_url || "";
  const title = raw.title || raw.headline || "(제목 없음)";

  const category =
    raw.category && raw.category !== "기타"
      ? raw.category
      : inferCategoryFromNews(raw);

  const id =
    (raw.id ?? raw.articleId ?? raw.news_id ?? url) ||
    `${title}-${raw.published_at || Date.now()}`;

  const createdAt = raw.published_at
    ? new Date(raw.published_at).getTime()
    : Date.now();

  return {
    id,
    category,
    badge: "추천",
    title,
    thumbnailUrl: raw.thumbnail
      ? raw.thumbnail
      : `${(THUMB[category] || THUMB.it)}${UQ}`,
    summary: ["추천 기사입니다. 상세는 본문에서 확인하세요."],
    createdAt,
    raw: { ...raw, url },
  };
}

export default function MainPage() {
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [recoItems, setRecoItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(INITIAL_ARTICLES[0]?.id || 1);
  const [articleListMode, setArticleListMode] = useState("daily");

  const swiperRef = useRef(null);

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

  /**  로그 저장/업데이트용 ref들 */
  const viewStartRef = useRef(null); // 현재 기사 뷰 시작 시간
  const logMapRef = useRef(new Map()); // articleId -> logId

  const fetchPageAndAppend = async (targetPage) => {
    const cacheKey = `${targetPage}:${size}:${q}`;

    // 캐시 있으면 바로 사용
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setArticles((prev) => {
        const dedup = new Map();
        for (const a of prev) dedup.set(String(a.id), a);
        for (const a of cached) dedup.set(String(a.id), a);
        return Array.from(dedup.values()).sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );
      });
      return cached.length;
    }

    //  이미 "성공적으로" 가져온 것만 스킵
    if (fetchedPagesRef.current.has(cacheKey)) return 0;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError("");

      const res = await fetchNews(
        { page: targetPage, size, q },
        { signal: controller.signal }
      );

      const data = res.data;
      const list = Array.isArray(data?.items) ? data.items : [];
      const mapped = list.map(mapNewsToArticle);

      //  성공했을 때만 “가져옴 처리”
      fetchedPagesRef.current.add(cacheKey);
      cacheRef.current.set(cacheKey, mapped);

      setArticles((prev) => {
        const dedup = new Map();
        for (const a of prev) dedup.set(String(a.id), a);
        for (const a of mapped) dedup.set(String(a.id), a);
        return Array.from(dedup.values()).sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );
      });

      return mapped.length;
    } catch (e) {
      //  취소된 요청이면 “가져옴 처리”를 절대 남기지 않음
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") {
        // 혹시 이전 코드에서 add된 키가 남아있을 수 있으니 안전하게 제거
        fetchedPagesRef.current.delete(cacheKey);
        return 0;
      }

      fetchedPagesRef.current.delete(cacheKey); // 실패도 재시도 가능하게
      setError(e?.response?.data?.message || "뉴스를 불러오지 못했습니다.");
      return 0;
    } finally {
      setLoading(false);
    }
  };

  //  로그 생성
const createLog = async (article, action = "view") => {
  if (!userId) return { ok: false, skipped: true }; // 로그인 전이면 스킵
  try {
    const payload = {
      article_id: Number(article?.id) || null,
      url: article?.url,
      stay_time: 0,
      scroll_depth: 0,
    };
    const res = await axios.post("/log", payload);
    const logId = res.data?.logId ?? res.data?.id ?? res.data?.data?.logId;
    if (logId != null) logMapRef.current.set(String(article.id), logId);
    return { ok: true, status: res.status, logId, data: res.data };
  } catch (e) {
    return { ok: false, status: e?.response?.status, message: e?.response?.data?.message || e.message };
  }
};

const updateLog = async (article, extra = {}) => {
  if (!userId) return; // 로그인 전이면 스킵
  try {
    const logId = logMapRef.current.get(String(article?.id));
    if (!logId) return;
    await axios.put(`/log/${logId}`, { ...extra, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("log update failed:", e);
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

      // ✅ 로그인 안 한 상태(401)는 정상 흐름 → 조용히 처리
      if (status === 401) {
        setUserId(null);
        return;
      }

      // ✅ 그 외 에러만 로그 찍기
      console.error("[auth/me] failed:", e);
      setUserId(null);
    }
  };

  loadMe();
}, []);

  // 초기 1페이지 로딩
  const didInitRef = useRef(false);
  const pageRef = useRef(1);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const loadInitial = async () => {
      await fetchPageAndAppend(1);
      await fetchPageAndAppend(2);
      await fetchPageAndAppend(3);

      pageRef.current = 3; // 다음 페이지부터 이어서 불러오기 위해
      setPage(3);
    };

    loadInitial();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipAbortFirstRunRef = useRef(true);

  useEffect(() => {
    //  첫 렌더(초기 진입)에서는 abort 하지 않기
    if (skipAbortFirstRunRef.current) {
      skipAbortFirstRunRef.current = false;
      return;
    }

    if (abortRef.current) abortRef.current.abort();
  }, [selectedCategory]);

  // 현재 카테고리가 너무 적으면 자동으로 추가 페이지 로딩
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  /**  추천 불러오기 (응답 items를 UI용 article로 매핑) */
  useEffect(() => {
    const loadReco = async () => {
      try {
        const res = await axios.get("/reco", {
          params: { k: 20, userId },
        });

        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        const mapped = items.map(mapRecoItemToArticle);
        setRecoItems(mapped);
      } catch (err) {
        console.error("추천 불러오기 실패", err);
        setRecoItems([]);
      }
    };

    loadReco();
  }, []);

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

  const selectedArticle = useMemo(() => {
    if (!filtered.length) return null;
    const fromFiltered = filtered.find((a) => String(a.id) === String(selectedId));
    return fromFiltered || filtered[0];
  }, [filtered, selectedId]);

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return articles.filter((a) => a.id !== selectedArticle.id).slice(0, 6);
  }, [selectedArticle, articles]);

  const contrastArticles = useMemo(() => {
    if (!selectedArticle) return [];

    const source = articles.filter((a) => a.id !== selectedArticle.id);
    const oppositeCategories = OPPOSITE_CATEGORY_MAP[selectedArticle.category] || [];
    const allCategories = CATEGORIES.map((c) => c.key).filter((k) => k !== "all");
    const fallbackCategories = allCategories.filter(
      (k) => k !== selectedArticle.category && !oppositeCategories.includes(k)
    );

    const primary = source.filter((a) => oppositeCategories.includes(a.category));
    const secondary = source.filter((a) => fallbackCategories.includes(a.category));
    const tail = source.filter(
      (a) => !oppositeCategories.includes(a.category) && !fallbackCategories.includes(a.category)
    );

    return [...primary, ...secondary, ...tail].slice(0, 6);
  }, [selectedArticle, articles]);

  const latestItems = useMemo(() => {
    const sorted = [...articles].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return sorted.slice(0, 15);
  }, [articles]);

  // 탭 바뀌면 첫 기사로 맞추기
  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }

    const exists =
      selectedId != null &&
      filtered.some((a) => String(a.id) === String(selectedId));

    if (!exists) {
      setSelectedId(String(filtered[0].id));
      if (swiperRef.current) swiperRef.current.slideTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedCategory]);

  /**  selectedArticle가 바뀔 때: 이전 기사 dwellTime 업데이트 + 새 기사 view 로그 생성 */
  useEffect(() => {
    const prevStart = viewStartRef.current;
    // 이전 기사 dwell 업데이트
    // prevStart가 있고, 이전 selectedArticle를 따로 저장해야 정확하지만,
    // 여기서는 "바뀌기 직전"을 잡기 위해 ref로 이전 article을 저장
  }, []);

  const prevArticleRef = useRef(null);
  useEffect(() => {
    const now = Date.now();

    // 이전 기사 업데이트
    if (prevArticleRef.current && viewStartRef.current) {
      const dwellMs = now - viewStartRef.current;
      updateLog(prevArticleRef.current, { dwellMs });
    }

    // 새 기사 로그 생성
    if (selectedArticle) {
      createLog(selectedArticle, "view");
      viewStartRef.current = now;
      prevArticleRef.current = selectedArticle;
    } else {
      viewStartRef.current = null;
      prevArticleRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArticle?.id]);

  // selectedId가 바뀌면 Swiper 인덱스 동기화
  useEffect(() => {
    if (!swiperRef.current) return;
    const idx = filtered.findIndex((a) => a.id === selectedId);
    if (idx >= 0 && swiperRef.current.activeIndex !== idx) {
      swiperRef.current.slideTo(idx, 0);
    }
  }, [filtered, selectedId]);

  /**  본문 보기 클릭: click 로그 + dwellTime 업데이트 후 새 탭 */
  const openOriginal = async (article) => {
    const url = article?.raw?.url;
    if (!url) {
      alert("원문 링크가 없습니다.");
      return;
    }

    // 클릭 로그(생성)
    await createLog(article, "open");

    // 현재 view dwell 업데이트
    if (viewStartRef.current) {
      const dwellMs = Date.now() - viewStartRef.current;
      await updateLog(article, { dwellMs, opened: true });
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mp-wrap">
      <div className="mp-grid">
        {/* LEFT */}
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
                    onClick={() => setArticleListMode("daily")}
                    aria-pressed={articleListMode === "daily"}
                  >
                    일간
                  </button>
                  <button
                    type="button"
                    className={`mp-article-tab ${articleListMode === "weekly" ? "active" : ""}`}
                    onClick={() => setArticleListMode("weekly")}
                    aria-pressed={articleListMode === "weekly"}
                  >
                    주간
                  </button>
                </div>
              </div>

            <div className="mp-article-list">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`mp-article-item ${a.id === selectedArticle?.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedId(String(a.id));
                    // 리스트 클릭도 로그(원하면 유지)
                    createLog(a, "click");
                  }}
                >
                  <div className="mp-article-item-top">
                    <span className="mp-article-item-cat">{getCategoryLabel(a.category)}</span>
                    <span
                      className={`mp-article-item-badge ${
                      String(a.badge).trim().toUpperCase() === "HOT" ? "hot" : "new"
                   }`}
>
                      {a.badge}
                    </span>
                  </div>
                  <div className="mp-article-item-title">{a.title}</div>
                </button>
              ))}
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
                더 불러오기
              </button>
            </div>
          </div>
          </div>
        </aside>

        {/* CENTER */}
        <main className="mp-center">
          {!selectedArticle ? (
            <div style={{ padding: 20, opacity: 0.8 }}>
              {loading ? "불러오는 중..." : "표시할 기사가 없습니다."}
            </div>
          ) : (
            <Swiper
              key={selectedCategory}
              direction="vertical"
              slidesPerView={1}
              mousewheel={{ forceToAxis: true, releaseOnEdges: false }}
              speed={600}
              modules={[Mousewheel]}
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              onSlideChange={(s) => {
                const next = filtered[s.activeIndex];
                if (next) setSelectedId(String(next.id));
              }}
              className="mp-center-swiper"
            >
              {filtered.map((article) => (
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
                      />
                      <div className="mp-thumb-label">AI 생성 썸네일</div>
                    </div>

                    <section className="mp-summary">
                      <div className="mp-section-title">요약</div>
                      <div className="mp-summary-lines">
                        {(article.summary || []).slice(0, 10).map((line, idx) => (
                          <p key={idx} className="mp-summary-line">
                            {line}
                          </p>
                        ))}
                      </div>

                      <div className="mp-actions">
                        <button
                          className="mp-btn primary"
                          type="button"
                          onClick={() => openOriginal(article)}
                        >
                          본문 보기
                        </button>
                        <button className="mp-btn" type="button">
                          저장
                        </button>
                        <button className="mp-btn" type="button">
                          공유
                        </button>
                      </div>
                    </section>

                    <LatestCarousel
                      items={latestItems}
                      onItemClick={(a) => {
                        setSelectedCategory(a.category);
                        setSelectedId(a.id);
                        createLog(a, "click");
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </main>

        {/* RIGHT */}
        <aside className="mp-right">
          <div className="mp-panel">
            <div className="mp-panel-title">관련 기사</div>
            <div className="mp-related-list">
              {(recoItems.length ? recoItems : relatedArticles).map((a) => (
                <RelatedItem
                  key={a.id}
                  title={a.title}
                  meta={`${getCategoryLabel(a.category)} · 관련`}
                  onClick={() => {
                    setSelectedCategory(a.category || "all");
                    setSelectedId(a.id);
                    createLog(a, "click");
                  }}
                />
              ))}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">반대 관점 기사</div>
            <div className="mp-related-list">
              {contrastArticles.map((a) => (
                <RelatedItem
                  key={`contrast-${a.id}`}
                  title={a.title}
                  meta={`${getCategoryLabel(a.category)} · 대조`}
                  onClick={() => {
                    setSelectedCategory(a.category || "all");
                    setSelectedId(a.id);
                    createLog(a, "click");
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
