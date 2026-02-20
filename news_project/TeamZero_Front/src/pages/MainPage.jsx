import React, { useEffect, useMemo, useRef, useState } from "react";
import "../CSS/main.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";


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

/** ✅ 긴 URL 줄이기(채팅/VSCode에서 "오른쪽 잘림" 체감 줄이기) */
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

/** ✅ 초기 기사(기존 SAMPLE_ARTICLES 유지 + createdAt만 추가) */
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
      "보안과 개인정보 보호 기준도 강화되는 추세입니다.",
      "모델 경량화와 멀티모달 기능이 빠르게 확산 중입니다.",
      "규제와 표준화 논의도 함께 진행되고 있습니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: 2,
    category: "economy",
    badge: "최신",
    title: "물가·금리 변수 속 소비심리 변화… 유통 업계 전략 수정",
    thumbnailUrl: `${THUMB.economy}${UQ}`,
    summary: [
      "금리와 물가 변동성이 유통업계 전략에 영향을 주고 있습니다.",
      "프로모션과 가격 정책을 유연하게 조정하는 추세입니다.",
      "필수재 중심 소비가 강화되는 모습입니다.",
      "할인 경쟁과 PB 전략이 동시에 강화되고 있습니다.",
      "연말 수요 회복을 대비한 재고 조정도 진행 중입니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 3,
    category: "society",
    badge: "HOT",
    title: "도심 교통 혼잡 완화 대책… 대중교통 확대·수요 분산",
    thumbnailUrl: `${THUMB.society}${UQ}`,
    summary: [
      "도심 교통 혼잡을 줄이기 위한 정책이 논의 중입니다.",
      "대중교통 확대와 수요 분산 정책이 핵심입니다.",
      "지자체는 교통 인프라 개선에 집중하고 있습니다.",
      "혼잡 통행료 등 추가 대책도 검토됩니다.",
      "시민 참여형 모니터링도 도입될 예정입니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 70,
  },
  {
    id: 4,
    category: "politics",
    badge: "HOT",
    title: "국회, 핵심 법안 조정 논의 확대",
    thumbnailUrl: `${THUMB.politics}${UQ}`,
    summary: [
      "정치 분야에서 주요 법안 조정 논의가 진행 중입니다.",
      "사회적 합의를 통해 정책을 보완하는 방향입니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 5,
    category: "world",
    badge: "최신",
    title: "국제 경제 재편, 공급망 안정 전략 부각",
    thumbnailUrl: `${THUMB.world}${UQ}`,
    summary: [
      "국제 공급망 리스크 대응을 위한 협상이 이어지고 있습니다.",
      "해외 투자와 회복 시나리오가 논의됩니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 110,
  },
  {
    id: 6,
    category: "culture",
    badge: "HOT",
    title: "대형 페스티벌 회복으로 문화 수요 회복",
    thumbnailUrl: `${THUMB.culture}${UQ}`,
    summary: [
      "지역 축제 재개로 관광 수요가 살아나고 있습니다.",
      "전시·공연 예약이 활발해지고 있습니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 130,
  },
  {
    id: 7,
    category: "sports",
    badge: "최신",
    title: "프로리그 시즌 개막, 신인 선수 활약",
    thumbnailUrl: `${THUMB.sports}${UQ}`,
    summary: [
      "신인 선수들의 활약으로 경기 흐름이 빨라지고 있습니다.",
      "팀 간 전술 대결이 본격적으로 시작됩니다.",
    ],
    createdAt: Date.now() - 1000 * 60 * 150,
  }
];

/** ✅ “최신기사 자동 업로드” 더미 생성용 풀 */
const CATEGORY_POOL = ["politics", "economy", "society", "world", "it", "culture", "sports"];
const TITLE_POOL = {
  politics: [
    "국회, 주요 현안 논의와 민생 법안 처리 속도",
    "야당·여당, 예산안 조정 협상 진행",
    "지방 정책 발표와 지역 현안 해법 모색",
  ],
  economy: [
    "환율 변동성 확대, 수출 기업 대응 분주",
    "금리 동결 전망 속 시장 관망세",
    "물가 안정 조짐… 유통·소비 업계 변화",
  ],
  society: [
    "교육 현장 디지털 전환… 학습 격차 해소 과제",
    "지역 의료 공백 해소 위한 공공 인프라 강화",
    "재난 대응 강화로 생활 SOC 개선 추진",
  ],
  world: [
    "글로벌 공급망 재편으로 기업 전략 변화",
    "주요국 통화정책 변화에 국제 시장 출렁",
    "기후 협력 강화… 탄소 감축 논의 확대",
  ],
  it: [
    "AI 서비스 고도화로 개인정보 보안 기준 강화",
    "반도체 투자 확대… 첨단 공정 경쟁 심화",
    "클라우드 비용 최적화와 기업 IT 전략 재정비",
  ],
  culture: [
    "공연·전시 수요 회복, 문화 콘텐츠 시장 활기",
    "OTT 시장 경쟁 심화… 콘텐츠 투자 확대",
    "출판 시장 변화 속 디지털 콘텐츠 성장",
  ],
  sports: [
    "프로리그 순위 경쟁 치열… 중반 판도 변동",
    "국제 대회 참가 명단 발표… 팬 관심 집중",
    "부상 복귀 선수 합류로 전력 변화",
  ],
};

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

/** ✅ 최신기사 카드(슬라이더용) */
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

/** ✅ 요약 밑 “최신 기사 슬라이더” */
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
    if (dragRef.current.rafId) {
      cancelAnimationFrame(dragRef.current.rafId);
      dragRef.current.rafId = 0;
    }
    if (dragRef.current.smoothingRafId) {
      cancelAnimationFrame(dragRef.current.smoothingRafId);
      dragRef.current.smoothingRafId = 0;
    }
    dragRef.current.pointerId = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if capture is not supported
    }
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
      const moveStep = () => {
        if (!dragRef.current.active) {
          dragRef.current.moveRafId = 0;
          return;
        }
        el.scrollLeft = dragRef.current.targetScrollLeft;
        dragRef.current.moveRafId = 0;
      };
      dragRef.current.moveRafId = requestAnimationFrame(moveStep);
    }
    e.preventDefault();
  };

  const stopDrag = () => {
    const el = trackRef.current;
    if (!el) return;
    dragRef.current.active = false;
    el.classList.remove("is-dragging");
    if (dragRef.current.moveRafId) {
      cancelAnimationFrame(dragRef.current.moveRafId);
      dragRef.current.moveRafId = 0;
    }
    try {
      // release pointer capture if it was set
      if (dragRef.current.pointerId !== null) {
        el.releasePointerCapture(dragRef.current.pointerId);
      }
    } catch {
      // ignore
    }
    dragRef.current.pointerId = null;

    const startVelocity = dragRef.current.velocity;
    if (Math.abs(startVelocity) < 0.02) return;

    const step = () => {
      const v = dragRef.current.velocity * 0.95;
      dragRef.current.velocity = v;
      el.scrollLeft -= v * 16;
      if (Math.abs(v) > 0.02) {
        dragRef.current.rafId = requestAnimationFrame(step);
      } else {
        dragRef.current.rafId = 0;
      }
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

export default function MainPage() {
  /** ✅ 기존 SAMPLE_ARTICLES → state로 (자동 업로드를 위해) */
  const [articles, setArticles] = useState(INITIAL_ARTICLES);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(INITIAL_ARTICLES[0]?.id || 1);
  const swiperRef = useRef(null);

  /** ✅ 자동 업로드용 id */
  const nextIdRef = useRef(
    Math.max(...INITIAL_ARTICLES.map((a) => a.id)) + 1
  );

  /** ✅ “최신기사 계속 업로드” (더미: 12초마다 1개) */
  useEffect(() => {
    const makeAutoArticle = () => {
      const id = nextIdRef.current++;
      const category = CATEGORY_POOL[Math.floor(Math.random() * CATEGORY_POOL.length)];
      const titles = TITLE_POOL[category] || ["최신 이슈 업데이트"];
      const title = titles[Math.floor(Math.random() * titles.length)];

      const label = getCategoryLabel(category);
      const createdAt = Date.now();

      return {
        id,
        category,
        badge: "최신",
        title,
        thumbnailUrl: `${(THUMB[category] || THUMB.it)}${UQ}`,
        summary: [
          `${label} 분야에서 새로운 이슈가 업데이트되었습니다.`,
          "관련 이해관계자들의 반응과 대응이 이어지고 있습니다.",
          "시장/여론 흐름에 영향을 줄 수 있다는 분석도 나옵니다.",
          "세부 내용은 추가 확인이 필요합니다.",
          "후속 보도가 이어질 전망입니다.",
        ],
        createdAt,
      };
    };

    const timer = setInterval(() => {
      setArticles((prev) => {
        const next = makeAutoArticle();
        const merged = [next, ...prev];
        return merged.slice(0, 60); // 너무 길어지지 않게 제한
      });
    }, 12000);

    return () => clearInterval(timer);
  }, []);

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

  /** ✅ 최신기사 슬라이더용: createdAt 기준 최신순 */
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
                    const next =
                      c.key === "all"
                        ? articles[0]
                        : articles.find((a) => a.category === c.key) || articles[0];
                    if (next?.id) setSelectedId(next.id);
                  }}
                />
              ))}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">기사 목록</div>
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

                  {/* ✅ 여기! 요약 밑에 최신기사 슬라이더 추가 */}
                  <LatestCarousel
                    items={latestItems}
                    onItemClick={(a) => {
                      // 최신기사 클릭 시, 해당 카테고리로 이동 + 본문 표시
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
                  meta={`${getCategoryLabel(a.category)} · ${
                    String(a.badge).toUpperCase() === "HOT" ? "핫이슈" : "최신"
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
