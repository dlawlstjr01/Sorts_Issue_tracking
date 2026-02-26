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

function CategoryButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`mp-cat-btn ${active ? "active" : ""}`}
      onClick={onClick}
    >
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
      if (dragRef.current.pointerId !== null)
        el.releasePointerCapture(dragRef.current.pointerId);
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
  const id = n.id ?? `${n.url || "news"}-${n.published_at || Date.now()}`;
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

  const swiperRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const size = 30;

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

    if (fetchedPagesRef.current.has(cacheKey)) return 0;
    fetchedPagesRef.current.add(cacheKey);

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
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return 0;
      setError(e?.response?.data?.message || "뉴스를 불러오지 못했습니다.");
      return 0;
    } finally {
      setLoading(false);
    }
  };

  //  로그 생성
  const createLog = async (article, action = "view") => {
    try {
      const payload = {
        article_id: Number(article?.id),
        url: article?.url,
        stay_time: 0,
        scroll_depth: 0,
      };
      const res = await axios.post("/log", payload);
      const logId = res.data?.logId ?? res.data?.id ?? res.data?.data?.logId;

      if (logId != null) logMapRef.current.set(String(article.id), logId);

      return { ok: true, status: res.status, logId, data: res.data };
    } catch (e) {
      return {
        ok: false,
        status: e?.response?.status,
        message: e?.response?.data?.message || e.message,
      };
    }
  };

  //  로그 업데이트 (체류시간 등)
  const updateLog = async (article, extra = {}) => {
    try {
      const logId = logMapRef.current.get(String(article?.id));
      if (!logId) return;

      const payload = {
        ...extra,
        updatedAt: new Date().toISOString(),
      };

      await axios.put(`/log/${logId}`, payload);
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
        setUserId(null);
      }
    };
    loadMe();
  }, []);

  // 초기 1페이지 로딩
  useEffect(() => {
    fetchPageAndAppend(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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

  const selectedArticle = useMemo(() => {
    if (!filtered.length) return null;
    const fromFiltered = filtered.find((a) => a.id === selectedId);
    return fromFiltered || filtered[0];
  }, [filtered, selectedId]);

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return articles.filter((a) => a.id !== selectedArticle.id).slice(0, 6);
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
    setSelectedId(filtered[0].id);
    if (swiperRef.current) swiperRef.current.slideTo(0, 0);
  }, [selectedCategory, filtered]);

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
                  active={selectedCategory === c.key}
                  onClick={() => {
                    setSelectedCategory(c.key);
                  }}
                />
              ))}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">기사 목록</div>

            {loading && <div style={{ padding: 12, opacity: 0.8 }}>불러오는 중...</div>}
            {error && <div style={{ padding: 12, color: "crimson" }}>{error}</div>}

            {!loading && !error && filtered.length === 0 && (
              <div style={{ padding: 12, opacity: 0.8 }}>
                해당 카테고리 기사가 없습니다. (데이터를 더 불러오는 중일 수 있어요)
              </div>
            )}

            <div className="mp-article-list">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`mp-article-item ${a.id === selectedArticle?.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedId(a.id);
                    // 리스트 클릭도 로그(원하면 유지)
                    createLog(a, "click");
                  }}
                >
                  <div className="mp-article-item-top">
                    <span className="mp-article-item-cat">{getCategoryLabel(a.category)}</span>
                    <span className={`mp-article-item-badge new`}>{a.badge}</span>
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
        </aside>

        {/* CENTER */}
        <main className="mp-center">
          {!selectedArticle ? (
            <div style={{ padding: 20, opacity: 0.8 }}>
              {loading ? "불러오는 중..." : "표시할 기사가 없습니다."}
            </div>
          ) : (
            <Swiper
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
                if (next) setSelectedId(next.id);
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
            <div className="mp-panel-title">추천 기사</div>
            <div className="mp-related-list">
              {(recoItems.length ? recoItems : relatedArticles).map((a) => (
                <RelatedItem
                  key={a.id}
                  title={a.title}
                  meta={`${getCategoryLabel(a.category)} · 추천`}
                  onClick={() => {
                    setSelectedCategory(a.category || "all");
                    setSelectedId(a.id);
                    createLog(a, "click");
                  }}
                />
              ))}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">과거 연관 이슈</div>
            <div className="mp-past">
              <div className="mp-past-item">동일 키워드가 포함된 이슈를 모아 타임라인으로 제공</div>
              <div className="mp-past-item">주간 리포트/아카이브로 바로 이동할 수 있도록 연결</div>
              <div className="mp-past-item">(데이터 연동 시) 클릭하면 해당 이슈 상세로 이동</div>
            </div>
          </div>

          <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999 }}>
            <button
              type="button"
              className="mp-btn"
              onClick={async () => {
                const a = selectedArticle || articles[0];
                const r = await createLog(a, "test");
                if (r.ok) alert(`✅ LOG OK\nstatus=${r.status}\nlogId=${r.logId ?? "(없음)"}`);
                else alert(`❌ LOG FAIL\nstatus=${r.status ?? "(없음)"}\n${r.message}`);
              }}
            >
              로그 테스트
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}