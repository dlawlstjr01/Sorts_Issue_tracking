import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SideMenuCard from "../../components/SideMenuCard";
import { removeArchiveItem } from "../../utils/archiveStorage";
import { removeRecentItem } from "../../utils/recentStorage";

// ✅ (있으면) 아카이브 컨텍스트 사용
// 없으면 아래 try/catch fallback으로 localStorage에서 읽도록 처리함
let useArchiveSafe = null;
try {
  // 경로는 프로젝트에 맞게 수정하세요
  // 예: "../../context/ArchiveContext"
  // 예: "../../contexts/ArchiveContext"
  // eslint-disable-next-line global-require, import/no-unresolved
  const m = require("../../context/ArchiveContext");
  useArchiveSafe = m.useArchive;
} catch {
  useArchiveSafe = null;
}

const tabs = [
  { key: "saved", label: "저장한 기사" },
  { key: "recent", label: "최근 본 기사" },
  { key: "keywords", label: "관심 키워드" },
];

// ✅ 메인에서 쓰던 카테고리 정규화
function normalizeCategory(raw) {
  const v = String(raw || "").toLowerCase();
  if (v.includes("polit")) return "정치";
  if (v.includes("econ")) return "경제";
  if (v.includes("soc")) return "사회";
  if (v.includes("world") || v.includes("intl")) return "국제";
  if (v === "it" || v.includes("sci")) return "IT/과학";
  if (v.includes("cult") || v.includes("ent")) return "문화";
  if (v.includes("sport")) return "스포츠";
  return raw || "기타";
}

function formatYMD(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * ✅ saved/recent 공통 UI 아이템으로 안전 매핑
 * - archive 저장 구조(우리가 저장한 구조)
 * - 또는 news 아이템 구조(n.id, n.title, n.category, n.published_at, n.url 등)
 * 둘 다 대응
 */
function mapAnyToArchiveItem(x) {
  const raw = x?.raw ?? x ?? {};
  const id = x?.id ?? raw?.id ?? raw?.article_id ?? raw?.articleId ?? raw?.url ?? raw?.link ?? `${Date.now()}`;

  const title = x?.title ?? raw?.title ?? raw?.headline ?? "(제목 없음)";
  const categoryRaw = x?.category ?? raw?.category ?? "기타";
  const dateRaw =
    x?.date ??
    raw?.published_at ??
    raw?.created_at ??
    raw?.viewed_at ??
    x?.savedAt ??
    x?.saved_at;

  const url = x?.url ?? raw?.url ?? raw?.link ?? "";

  return {
    id: String(id),
    title,
    category: normalizeCategory(categoryRaw),
    date: formatYMD(dateRaw),
    summary: url
      ? "기사를 클릭하면 상세 내용을 확인할 수 있습니다."
      : "요약 정보가 없습니다.",
    raw: { ...raw, url },
  };
}

export default function ArchivePage() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("saved");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [activeKeyword, setActiveKeyword] = useState("AI");
  // ✅ 실시간 이슈 상세 모달 상태: 선택된 카드가 있을 때만 상세를 연다.
  const [selectedTrend, setSelectedTrend] = useState(null);

  // ✅ 저장한 기사: 컨텍스트(있으면)에서 가져오고, 없으면 localStorage fallback
  const archiveCtx = useArchiveSafe ? useArchiveSafe() : null;
  const savedFromCtx = Array.isArray(archiveCtx?.archive) ? archiveCtx.archive : null;

  const [savedItems, setSavedItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);

  // ✅ 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 페이지네이션
  const [page, setPage] = useState(1);
  const size = 50;

  // ✅ 관심 키워드 버튼: 숫자는 렌더 시 실제 기사 개수로 계산한다.
  const keywordItems = [
    { id: 21, label: "AI" },
    { id: 22, label: "금리" },
    { id: 23, label: "교통" },
    { id: 24, label: "공급망" },
    { id: 25, label: "문화행사" },
  ];

  const keywordArticles = {
    AI: [
      { id: "ai-1", title: "AI 서비스 확산… 개인정보·보안 기준 강화", category: "IT/과학", date: "2026-02-03", summary: "AI 서비스 확산에 따라 개인정보 보호 기준이 강화되는 추세입니다." },
      { id: "ai-2", title: "클라우드 비용 최적화… 기업 IT 전략 재정비", category: "IT/과학", date: "2026-02-01", summary: "클라우드 비용 최적화 전략이 기업 IT 로드맵의 핵심이 되고 있습니다." },
    ],
    금리: [{ id: "rate-1", title: "금리 동결 전망 속 시장 관망세", category: "경제", date: "2026-02-02", summary: "금리 동결 가능성이 높아지며 시장 관망세가 이어지고 있습니다." }],
    교통: [{ id: "traffic-1", title: "도심 교통 혼잡 완화 대책… 수요 분산", category: "사회", date: "2026-01-31", summary: "대중교통 확대와 수요 분산 정책이 추진되고 있습니다." }],
    공급망: [{ id: "supply-1", title: "글로벌 공급망 재편… 산업 경쟁 지형 변화", category: "국제", date: "2026-01-30", summary: "공급망 재편으로 산업 경쟁 구도가 빠르게 변하고 있습니다." }],
    문화행사: [{ id: "culture-1", title: "공연·전시 수요 회복… 지역 문화행사 활기", category: "문화", date: "2026-01-29", summary: "지역 문화행사가 다시 활성화되는 흐름입니다." }],
  };

  const trendingItems = [
    {
      id: "trend-1",
      title: "생성형 AI 경쟁 심화로 모델 성능·비용 최적화 관련",
      category: "IT/과학",
      views: "12.4k",
      detail: {
        summary: "기업들이 고성능 모델 유지 비용을 줄이기 위해 경량화 모델과 하이브리드 추론 전략을 병행하는 흐름입니다.",
        points: [
          "대규모 모델과 경량 모델을 혼합해 업무별로 비용을 최적화합니다.",
          "보안 이슈로 인해 온프레미스 추론 수요가 함께 증가하고 있습니다.",
          "성능 비교 지표 표준화가 미흡해 벤치마크 해석 주의가 필요합니다.",
        ],
        updatedAt: "2026-03-11 09:30",
      },
    },
    {
      id: "trend-2",
      title: "금리 변동성 확대, 유통 업계 판매 전략 조정",
      category: "경제",
      views: "9.8k",
      detail: {
        summary: "금리 불확실성이 커지면서 유통 업계가 재고 회전율 중심 전략과 단기 프로모션 비중을 높이고 있습니다.",
        points: [
          "고정비 비중이 큰 채널은 단기 할인보다 고마진 상품군 강화에 집중합니다.",
          "온라인 채널은 가격 민감 고객을 겨냥한 번들형 상품 비중을 확대합니다.",
          "중소 유통사는 금융비용 증가에 따라 발주 주기를 짧게 가져가는 추세입니다.",
        ],
        updatedAt: "2026-03-11 08:10",
      },
    },
    {
      id: "trend-3",
      title: "도시 교통 혼잡 완화 대책, 대중교통 확대 수요 분산",
      category: "사회",
      views: "8.1k",
      detail: {
        summary: "출퇴근 혼잡 구간을 중심으로 버스 노선 재배치와 환승 편의 개선을 통해 통행량 분산을 유도하고 있습니다.",
        points: [
          "혼잡 시간대 증차보다 환승 동선 단축이 체감 개선 효과가 큽니다.",
          "도심 주차 정책과 연계해야 대중교통 전환 효과가 유지됩니다.",
          "정책 성과는 최소 4주 이상 누적 데이터로 평가하는 것이 적절합니다.",
        ],
        updatedAt: "2026-03-10 19:40",
      },
    },
    {
      id: "trend-4",
      title: "기업 클라우드 이전 가속화, 보안 기준 재정립",
      category: "IT/과학",
      views: "6.7k",
      detail: null,
    },
  ];

  // ✅ saved: 컨텍스트/로컬스토리지에서 가져온 값 반영
  useEffect(() => {
    // 컨텍스트가 있으면 그거 사용
    if (Array.isArray(savedFromCtx)) {
      setSavedItems(savedFromCtx.map(mapAnyToArchiveItem));
      return;
    }

    // fallback: localStorage("archive")
    try {
      const saved = JSON.parse(localStorage.getItem("archive") || "[]");
      if (Array.isArray(saved)) setSavedItems(saved.map(mapAnyToArchiveItem));
      else setSavedItems([]);
    } catch {
      setSavedItems([]);
    }
  }, [savedFromCtx]);

  // ✅ recent: localStorage("recentArticles")에서 읽어서 표시
  // (나중에 서버 API 생기면 여기만 axios로 바꾸면 됨)
  useEffect(() => {
    if (activeTab !== "recent") return;

    setLoading(true);
    setError("");

    try {
      const recent = JSON.parse(localStorage.getItem("recentArticles") || "[]");
      const arr = Array.isArray(recent) ? recent : [];
      setRecentItems(arr.map(mapAnyToArchiveItem));
    } catch (e) {
      setRecentItems([]);
      setError("최근 본 기사를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // ✅ 탭별 목록 선택
  const listItems = activeTab === "saved" ? savedItems : recentItems;

  // ✅ 검색/정렬 + 페이지 처리
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const items = (listItems || []).filter((item) => {
      if (!q) return true;
      return (
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.summary || "").toLowerCase().includes(q)
      );
    });

    const sorted =
      sort === "oldest"
        ? [...items].sort((a, b) => String(a.date).localeCompare(String(b.date)))
        : [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));

    // ✅ 간단한 프론트 페이지네이션(slice)
    const start = (page - 1) * size;
    const end = start + size;
    return sorted.slice(start, end);
  }, [listItems, query, sort, page, size]);

  // ✅ keywords 탭도 동일한 검색/정렬 규칙을 적용해 최신순/오래된순을 반영한다.
  const keywordFiltered = (() => {
    const q = query.trim().toLowerCase();
    const items = [...(keywordArticles[activeKeyword] || [])];

    const searched = items.filter((item) => {
      if (!q) return true;
      return (
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.summary || "").toLowerCase().includes(q)
      );
    });

    return sort === "oldest"
      ? searched.sort((a, b) => String(a.date).localeCompare(String(b.date)))
      : searched.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  })();

  // ✅ 목록 클릭 시 원문 열기(저장/최근 모두)
  const openItem = (item) => {
    const url = item?.raw?.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRemoveSaved = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    const result = removeArchiveItem(item);
    setSavedItems(result.items.map(mapAnyToArchiveItem));
  };

  const handleRemoveRecent = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    const result = removeRecentItem(item);
    setRecentItems(result.items.map(mapAnyToArchiveItem));
  };

  // ✅ 상세 데이터가 있는 카드만 모달을 열어 3번(비활성 처리) 기준을 지킨다.
  const openTrendDetail = (item) => {
    if (!item?.detail?.summary) return;
    setSelectedTrend(item);
  };

  // ✅ ESC 키로 상세 모달을 닫아 키보드 사용성도 맞춘다.
  useEffect(() => {
    if (!selectedTrend) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") setSelectedTrend(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedTrend]);

  return (
    <div className="page archive-page">
      <div className="login-head">
        <div className="pageTitle">아카이브</div>
        <div className="pageDesc">저장한 기사 / 최근 본 기사 / 관심 키워드</div>
      </div>

      <div className="archive-layout">
        <section className="archive-main">
          <div className="archive-tabs">
            {tabs.map((t) => (
              <motion.button
                key={t.key}
                type="button"
                className={`archive-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(t.key);
                  setPage(1);
                  setError("");
                }}
                // 탭 버튼도 동일한 hover/tap 모션으로 반응성을 맞춘다.
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                        mass: 0.55,
                      }
                }
              >
                {t.label}
              </motion.button>
            ))}
          </div>

          <div className="archive-toolbar">
            <input
              className="archive-search"
              type="text"
              placeholder="검색어를 입력하세요"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <div className="archive-sort">
              <motion.button
                type="button"
                className={sort === "latest" ? "active" : ""}
                onClick={() => setSort("latest")}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                        mass: 0.55,
                      }
                }
              >
                최신순
              </motion.button>
              <motion.button
                type="button"
                className={sort === "oldest" ? "active" : ""}
                onClick={() => setSort("oldest")}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                        mass: 0.55,
                      }
                }
              >
                오래된순
              </motion.button>
            </div>
          </div>

          {/* ✅ saved/recent 탭 */}
          {activeTab !== "keywords" && (
            <div className="archive-list">
              {loading && <div className="archive-empty">불러오는 중...</div>}
              {error && !loading && (
                <div className="archive-empty" style={{ color: "crimson" }}>
                  {error}
                </div>
              )}

              {!loading &&
                !error &&
                filtered.map((item) => (
                  <article
                    key={item.id}
                    className="archive-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => openItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openItem(item);
                    }}
                  >
                    <div className="archive-item-head">
                      <span className="archive-item-cat">{item.category}</span>
                      <div className="archive-item-actions">
                        <span className="archive-item-date">{item.date}</span>
                        {activeTab === "saved" && (
                          <button
                            type="button"
                            className="archive-item-remove"
                            onClick={(event) => handleRemoveSaved(event, item)}
                            aria-label="저장된 기사 삭제"
                          >
                            삭제
                          </button>
                        )}
                        {activeTab === "recent" && (
                          <button
                            type="button"
                            className="archive-item-remove"
                            onClick={(event) => handleRemoveRecent(event, item)}
                            aria-label="최근 본 기사 삭제"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="archive-item-title">{item.title}</div>
                    <div className="archive-item-summary">{item.summary}</div>
                  </article>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <div className="archive-empty">
                  {activeTab === "saved" ? "저장한 기사가 없습니다." : "최근 본 기사가 없습니다."}
                </div>
              )}

              {/* ✅ 페이지 버튼 */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                <button
                  type="button"
                  className="mp-btn"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  이전
                </button>
                <button
                  type="button"
                  className="mp-btn"
                  disabled={loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* ✅ keywords 탭 더미 유지 */}
          {activeTab === "keywords" && (
            <div className="archive-keywords-wrap">
              <div className="archive-keywords">
                {keywordItems.map((k) => (
                  <motion.button
                    key={k.id}
                    type="button"
                    className={`archive-keyword ${activeKeyword === k.label ? "active" : ""}`}
                    onClick={() => setActiveKeyword(k.label)}
                    whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            type: "spring",
                            stiffness: 420,
                            damping: 28,
                            mass: 0.55,
                          }
                    }
                  >
                    <span className="archive-keyword-label">{k.label}</span>
                    {/* ✅ 하드코딩 숫자 대신 실제 키워드 기사 수를 표시한다. */}
                    <span className="archive-keyword-count">
                      {(keywordArticles[k.label] || []).length}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div key={activeKeyword} className="archive-keyword-list is-animated">
                {keywordFiltered.map((item) => (
                  <article key={item.id} className="archive-item">
                    <div className="archive-item-head">
                      <span className="archive-item-cat">{item.category}</span>
                      <span className="archive-item-date">{item.date}</span>
                    </div>
                    <div className="archive-item-title">{item.title}</div>
                    <div className="archive-item-summary">{item.summary}</div>
                  </article>
                ))}
                {keywordFiltered.length === 0 && (
                  <div className="archive-empty">조건에 맞는 키워드 기사가 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="archive-aside">
          <SideMenuCard collapsible showScrollTop />

          <div className="archive-side-card">
            <div className="archive-side-head">
              <div>
                <div className="archive-side-title">
                  <img
                    className="archive-side-title-icon"
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' fill='%23e0ecff'/><path d='M13 5l-4 7h4l-1 7 5-8h-4l2-6z' fill='%231d4ed8'/></svg>"
                    alt=""
                  />
                  실시간 이슈
                </div>
                <div className="archive-side-desc">최근 7일 기준 인기 기사</div>
              </div>
              <span className="archive-side-badge">LIVE</span>
            </div>

            <div className="archive-side-list">
              {trendingItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`archive-side-item ${!item.detail?.summary ? "is-disabled" : ""}`}
                  disabled={!item.detail?.summary}
                  onClick={() => openTrendDetail(item)}
                  // ✅ 상세 가능 여부를 버튼 설명에 함께 넣어 접근성을 유지한다.
                  aria-label={`${item.title} ${item.detail?.summary ? "상세 보기" : "상세 준비중"}`}
                >
                  <span className="archive-side-rank">{String(index + 1).padStart(2, "0")}</span>
                  <div className="archive-side-body">
                    <div className="archive-side-meta">
                      <span className="archive-side-cat">{item.category}</span>
                      <span className="archive-side-views">{item.views} views</span>
                    </div>
                    <div className="archive-side-title-text">{item.title}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="archive-side-footer">업데이트: 지금 시간 기준</div>
          </div>
        </aside>
      </div>

      {selectedTrend && (
        <div
          className="archive-trend-modal-overlay"
          role="presentation"
          onClick={() => setSelectedTrend(null)}
        >
          <section
            className="archive-trend-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-trend-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="archive-trend-modal-head">
              <div>
                <div className="archive-trend-modal-badges">
                  <span className="archive-side-cat">{selectedTrend.category}</span>
                  <span className="archive-trend-modal-views">{selectedTrend.views} views</span>
                </div>
                <h3 id="archive-trend-modal-title" className="archive-trend-modal-title">
                  {selectedTrend.title}
                </h3>
              </div>
              <button
                type="button"
                className="mp-btn"
                onClick={() => setSelectedTrend(null)}
              >
                닫기
              </button>
            </div>

            <p className="archive-trend-modal-summary">{selectedTrend.detail?.summary}</p>

            {Array.isArray(selectedTrend.detail?.points) && selectedTrend.detail.points.length > 0 && (
              <ul className="archive-trend-modal-points">
                {selectedTrend.detail.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}

            <div className="archive-trend-modal-foot">
              <span>업데이트: {selectedTrend.detail?.updatedAt || "정보 없음"}</span>
              <span>ESC 키로 닫기</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
