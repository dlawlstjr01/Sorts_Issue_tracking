import React, { useEffect, useMemo, useState } from "react";
import SideMenuCard from "../../components/SideMenuCard";
import { fetchNews } from "../../api/newsApi"; // ✅ 경로 확인: api 폴더 위치에 맞게

const tabs = [
  { key: "saved", label: "저장한 기사" },
  { key: "recent", label: "최근 본 기사" },
  { key: "keywords", label: "관심 키워드" },
];

// ✅ 메인에서 쓰던 카테고리 정규화 (백엔드 category가 politics/economy... 라는 전제)
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

// ✅ 백엔드 /news item -> archive에서 쓰는 형태로 매핑
function mapNewsToArchiveItem(n) {
  return {
    id: n.id,
    title: n.title ?? "(제목 없음)",
    category: normalizeCategory(n.category),
    date: formatYMD(n.published_at ?? n.created_at),
    // 목록에는 content가 없으니 임시 요약
    summary: n.url ? "기사를 클릭하면 상세 내용을 확인할 수 있습니다." : "요약 정보가 없습니다.",
    raw: n, // 필요하면 url/thumbnail 등 사용
  };
}

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState("saved");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [activeKeyword, setActiveKeyword] = useState("AI");

  // ✅ API로부터 가져온 데이터
  const [savedItems, setSavedItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);

  // ✅ 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 페이지네이션(원하면 UI에 버튼 붙일 수 있음)
  const [page, setPage] = useState(1);
  const size = 50;

  // ✅ (기존 더미 유지) 관심 키워드 탭용
  const keywordItems = [
    { id: 21, label: "AI", count: 14 },
    { id: 22, label: "금리", count: 8 },
    { id: 23, label: "교통", count: 6 },
    { id: 24, label: "공급망", count: 5 },
    { id: 25, label: "문화행사", count: 4 },
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
    { id: "trend-1", title: "생성형 AI 경쟁 심화로 모델 성능·비용 최적화 관련", category: "IT/과학", views: "12.4k" },
    { id: "trend-2", title: "금리 변동성 확대, 유통 업계 판매 전략 조정", category: "경제", views: "9.8k" },
    { id: "trend-3", title: "도시 교통 혼잡 완화 대책, 대중교통 확대 수요 분산", category: "사회", views: "8.1k" },
    { id: "trend-4", title: "기업 클라우드 이전 가속화, 보안 기준 재정립", category: "IT/과학", views: "6.7k" },
  ];

  // ✅ 탭이 saved/recent일 때만 /news 호출 (keywords는 더미 유지)
  useEffect(() => {
    if (activeTab === "keywords") return;

    let alive = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchNews({
          page,
          size,
          q: query || undefined, // 검색어
          // category 필터도 붙이고 싶으면 여기 추가 가능
          // category: ...
        });

        const list = res.data?.items ?? [];
        const mapped = list.map(mapNewsToArchiveItem);

        if (!alive) return;

        // saved/recent를 지금은 동일 데이터로 보여주고 탭에 따라만 구분(추후 저장/최근본 구현 시 분리)
        setSavedItems(mapped);
        setRecentItems(mapped);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || "뉴스를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [activeTab, page, size, query]);

  const listItems = activeTab === "saved" ? savedItems : recentItems;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // ✅ 이미 API에 q 검색을 보내고 있지만, 프론트에서도 한 번 더 필터(안전)
    const items = listItems.filter((item) => {
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
    });

    if (sort === "oldest") {
      return [...items].sort((a, b) => a.date.localeCompare(b.date));
    }
    return [...items].sort((a, b) => b.date.localeCompare(a.date));
  }, [listItems, query, sort]);

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
              <button
                key={t.key}
                type="button"
                className={`archive-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(t.key);
                  setPage(1); // 탭 전환 시 첫 페이지
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="archive-toolbar">
            <input
              className="archive-search"
              type="text"
              placeholder="검색어를 입력하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="archive-sort">
              <button
                type="button"
                className={sort === "latest" ? "active" : ""}
                onClick={() => setSort("latest")}
              >
                최신순
              </button>
              <button
                type="button"
                className={sort === "oldest" ? "active" : ""}
                onClick={() => setSort("oldest")}
              >
                오래된순
              </button>
            </div>
          </div>

          {/* ✅ saved/recent 탭: API 결과 렌더링 */}
          {activeTab !== "keywords" && (
            <div className="archive-list">
              {loading && <div className="archive-empty">불러오는 중...</div>}
              {error && !loading && <div className="archive-empty" style={{ color: "crimson" }}>{error}</div>}

              {!loading &&
                !error &&
                filtered.map((item) => (
                  <article key={item.id} className="archive-item">
                    <div className="archive-item-head">
                      <span className="archive-item-cat">{item.category}</span>
                      <span className="archive-item-date">{item.date}</span>
                    </div>
                    <div className="archive-item-title">{item.title}</div>
                    <div className="archive-item-summary">{item.summary}</div>
                  </article>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <div className="archive-empty">검색 결과가 없습니다.</div>
              )}

              {/* ✅ (선택) 페이지 버튼 */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                <button type="button" className="mp-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                  이전
                </button>
                <button type="button" className="mp-btn" disabled={loading} onClick={() => setPage((p) => p + 1)}>
                  다음
                </button>
              </div>
            </div>
          )}

          {/* ✅ keywords 탭은 기존 더미 유지 */}
          {activeTab === "keywords" && (
            <div className="archive-keywords-wrap">
              <div className="archive-keywords">
                {keywordItems.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className={`archive-keyword ${activeKeyword === k.label ? "active" : ""}`}
                    onClick={() => setActiveKeyword(k.label)}
                  >
                    <span className="archive-keyword-label">{k.label}</span>
                    <span className="archive-keyword-count">{k.count}</span>
                  </button>
                ))}
              </div>

              <div key={activeKeyword} className="archive-keyword-list is-animated">
                {(keywordArticles[activeKeyword] || []).map((item) => (
                  <article key={item.id} className="archive-item">
                    <div className="archive-item-head">
                      <span className="archive-item-cat">{item.category}</span>
                      <span className="archive-item-date">{item.date}</span>
                    </div>
                    <div className="archive-item-title">{item.title}</div>
                    <div className="archive-item-summary">{item.summary}</div>
                  </article>
                ))}
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
                <button key={item.id} type="button" className="archive-side-item">
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
    </div>
  );
}
