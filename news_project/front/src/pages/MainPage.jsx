import React, { useEffect, useMemo, useRef, useState } from "react";
import "../CSS/main.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";

//  추가: newsApi 호출
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

//  탭별로 백엔드 검색어(q)로 분류
const CATEGORY_QUERY = {
  all: "",
  politics: "국회 OR 선거 OR 대통령 OR 장관 OR 여당 OR 야당",
  economy: "금리 OR 환율 OR 증시 OR 코스피 OR 물가 OR 부동산",
  society: "사건 OR 사고 OR 경찰 OR 검찰 OR 법원 OR 화재",
  world: "미국 OR 중국 OR 일본 OR 러시아 OR 우크라이나 OR UN",
  it: "AI OR 인공지능 OR 반도체 OR 삼성 OR 애플 OR 구글 OR 네이버",
  culture: "영화 OR 드라마 OR 연예 OR 공연 OR 전시 OR 문화재",
  sports: "KBO OR EPL OR NBA OR 축구 OR 야구 OR 올림픽 OR 손흥민",
};

/**  긴 URL 줄이기 */
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

/**  (선택) 더미 초기 기사: API가 비어있을 때만 fallback으로 쓰고 싶으면 유지 */
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
  },
];

const CATEGORY_POOL = ["politics", "economy", "society", "world", "it", "culture", "sports"];

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
    smoothingRafId: 0,
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
    if (dragRef.current.smoothingRafId) cancelAnimationFrame(dragRef.current.smoothingRafId);

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
      if (dragRef.current.pointerId !== null) el.releasePointerCapture(dragRef.current.pointerId);
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
          <button type="button" className="mp-latest-btn" onClick={() => scrollByAmount(-1)} aria-label="latest left">
            ◀
          </button>
          <button type="button" className="mp-latest-btn" onClick={() => scrollByAmount(1)} aria-label="latest right">
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

/**  API 응답 → 현재 UI 기사 구조로 매핑 */
function normalizeCategory(raw) {
  const v = String(raw || "").toLowerCase();
  if (v.includes("polit")) return "politics";
  if (v.includes("econ")) return "economy";
  if (v.includes("soc")) return "society";
  if (v.includes("world") || v.includes("intl")) return "world";
  if (v.includes("it") || v.includes("sci")) return "it";
  if (v.includes("cult") || v.includes("ent")) return "culture";
  if (v.includes("sport")) return "sports";
  // 혹시 한글이 오면 대충 대응
  if (v.includes("정치")) return "politics";
  if (v.includes("경제")) return "economy";
  if (v.includes("사회")) return "society";
  if (v.includes("국제")) return "world";
  if (v.includes("it") || v.includes("과학")) return "it";
  if (v.includes("문화")) return "culture";
  if (v.includes("스포츠")) return "sports";
  return "it";
}

function mapNewsToArticle(n, forcedCategory) {
  const id = n.id;

  const category = forcedCategory && forcedCategory !== "all"
    ? forcedCategory
    : normalizeCategory(n.category); // all 탭에서는 기존 로직 유지(기본 it)

  const title = n.title ?? "(제목 없음)";
  const thumb = n.thumbnail ? n.thumbnail : `${(THUMB[category] || THUMB.it)}${UQ}`;

  const rawTime = n.published_at ?? n.created_at;
  const createdAt = rawTime ? new Date(rawTime).getTime() : Date.now();

  const summary = ["요약은 상세 페이지에서 확인할 수 있습니다."];
  const badge = "최신";

  return {
    id,
    category,
    badge,
    title,
    thumbnailUrl: thumb,
    summary,
    createdAt,
    raw: n,
  };
}
export default function MainPage() {
  /**  실제 뉴스 데이터가 들어갈 state */
  const [articles, setArticles] = useState(INITIAL_ARTICLES);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(INITIAL_ARTICLES[0]?.id || 1);

  const swiperRef = useRef(null);

  /**  로딩/에러 */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**  페이지네이션(백엔드가 page/size 지원하므로 준비) */
  const [page, setPage] = useState(1);
  const size = 30; // 메인페이지는 넉넉히 받아두고 UI에서 필터/슬라이드

  /**  최초 + page 변경 시 뉴스 로드 */
  useEffect(() => {
    let alive = true;

    const loadNews = async () => {
      setLoading(true);
      setError("");
      try {
        const q = CATEGORY_QUERY[selectedCategory] || "";
        const res = await fetchNews({ page, size, q: q || undefined });

        const list = res.data?.items ?? [];
        const mapped = list.map((n) => mapNewsToArticle(n, selectedCategory));

        if (!alive) return;

        const dedup = new Map();
        for (const a of mapped) dedup.set(String(a.id), a);
        const merged = Array.from(dedup.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setArticles(merged.length ? merged : INITIAL_ARTICLES);

        if (merged.length) {
          setSelectedId(merged[0].id);
          if (swiperRef.current) swiperRef.current.slideTo(0, 0);
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || "뉴스를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadNews();
    return () => {
      alive = false;
    };

  }, [page, selectedCategory]); //  탭 바뀌면 다시 로드

  /**  (중요) 기존 더미 “12초 자동 업로드”는 실제 연동 시 꺼두는 게 맞습니다. */
  // 필요하면 다시 켤 수 있도록 주석으로 남겨둠.
  /*
  useEffect(() => {
    const makeAutoArticle = () => {
      const id = `${Date.now()}-${Math.random()}`;
      const category = CATEGORY_POOL[Math.floor(Math.random() * CATEGORY_POOL.length)];
      const label = getCategoryLabel(category);
      return {
        id,
        category,
        badge: "최신",
        title: `${label} 자동 업로드 더미`,
        thumbnailUrl: `${(THUMB[category] || THUMB.it)}${UQ}`,
        summary: [`${label} 분야에서 새로운 이슈가 업데이트되었습니다.`],
        createdAt: Date.now(),
      };
    };

    const timer = setInterval(() => {
      setArticles((prev) => [makeAutoArticle(), ...prev].slice(0, 60));
    }, 12000);

    return () => clearInterval(timer);
  }, []);
  */

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [selectedCategory, articles]);

  const selectedArticle = useMemo(() => {
    const fromFiltered = filtered.find((a) => a.id === selectedId);
    if (fromFiltered) return fromFiltered;
    return filtered[0] || articles[0];
  }, [filtered, selectedId, articles]);

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return articles.filter((a) => a.id !== selectedArticle.id).slice(0, 6);
  }, [selectedArticle, articles]);

  const latestItems = useMemo(() => {
    const sorted = [...articles].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return sorted.slice(0, 15);
  }, [articles]);

  useEffect(() => {
    if (!swiperRef.current) return;
    const idx = filtered.findIndex((a) => a.id === selectedId);
    if (idx >= 0 && swiperRef.current.activeIndex !== idx) {
      swiperRef.current.slideTo(idx, 0);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!swiperRef.current) return;
    swiperRef.current.slideTo(0, 0);
  }, [selectedCategory]);

  return (
    <div className="mp-wrap">
      <div className="mp-grid">
        {/* LEFT: 카테고리 */}
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
                    setPage(1);
                  }}
                />
              ))}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">기사 목록</div>

            {/*  로딩/에러 표시(기존 UI 크게 안 건드리기) */}
            {loading && <div style={{ padding: 12, opacity: 0.8 }}>불러오는 중...</div>}
            {error && <div style={{ padding: 12, color: "crimson" }}>{error}</div>}

            <div className="mp-article-list">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`mp-article-item ${a.id === selectedArticle?.id ? "active" : ""}`}
                  onClick={() => setSelectedId(a.id)}
                >
                  <div className="mp-article-item-top">
                    <span className="mp-article-item-cat">{getCategoryLabel(a.category)}</span>
                    <span className="mp-article-item-badge">{a.badge}</span>
                  </div>
                  <div className="mp-article-item-title">{a.title}</div>
                </button>
              ))}
            </div>

            {/*  (선택) 페이지네이션 버튼 - 백엔드가 page/size 지원할 때 */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: 12 }}>
              <button type="button" className="mp-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                이전 페이지
              </button>
              <button type="button" className="mp-btn" disabled={loading} onClick={() => setPage((p) => p + 1)}>
                다음 페이지
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: 메인 기사 */}
        <main className="mp-center">
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
                      <button className="mp-btn primary" type="button">
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
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </main>

        {/* RIGHT: 관련/과거 기사 */}
        <aside className="mp-right">
          <div className="mp-panel">
            <div className="mp-panel-title">관련 기사</div>
            <div className="mp-related-list">
              {relatedArticles.map((a) => (
                <RelatedItem
                  key={a.id}
                  title={a.title}
                  meta={`${getCategoryLabel(a.category)} · ${String(a.badge).toUpperCase() === "HOT" ? "핫이슈" : "최신"
                    }`}
                  onClick={() => {
                    setSelectedCategory(a.category);
                    setSelectedId(a.id);
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
        </aside>
      </div>
    </div>
  );
}