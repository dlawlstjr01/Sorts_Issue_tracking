import React, { useMemo, useState } from "react";
import SideMenuCard from "../../components/SideMenuCard";

export default function ArchivePage() {
  const tabs = [
    { key: "saved", label: "저장한 기사" },
    { key: "recent", label: "최근 본 기사" },
    { key: "keywords", label: "관심 키워드" },
  ];

  const [activeTab, setActiveTab] = useState("saved");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [activeKeyword, setActiveKeyword] = useState("AI");

  const savedItems = [
    {
      id: 1,
      title: "생성형 AI 경쟁 심화… 모델 성능·비용 최적화가 관건",
      category: "IT/과학",
      date: "2026-02-03",
      summary: "AI 모델 고도화 경쟁과 함께 추론 비용 최적화가 핵심 이슈로 떠올랐습니다.",
    },
    {
      id: 2,
      title: "물가·금리 변수 속 소비심리 변화… 유통 업계 전략 수정",
      category: "경제",
      date: "2026-02-02",
      summary: "소비 심리 변화로 유통 업계의 프로모션 및 가격 정책이 유연해지고 있습니다.",
    },
    {
      id: 3,
      title: "도심 교통 혼잡 완화 대책… 대중교통 확대·수요 분산",
      category: "사회",
      date: "2026-02-01",
      summary: "대중교통 확대와 수요 분산 정책이 핵심 대안으로 논의 중입니다.",
    },
  ];

  const recentItems = [
    {
      id: 11,
      title: "글로벌 공급망 재편… 산업 경쟁 지형 변화",
      category: "국제",
      date: "2026-02-03",
      summary: "공급망 재편으로 국가 간 산업 경쟁이 빠르게 재구성되고 있습니다.",
    },
    {
      id: 12,
      title: "공연·전시 수요 회복… 지역 문화행사 활기",
      category: "문화",
      date: "2026-02-02",
      summary: "지역 문화행사 활성화로 공연·전시 수요가 회복되는 추세입니다.",
    },
  ];

  const keywordItems = [
    { id: 21, label: "AI", count: 14 },
    { id: 22, label: "금리", count: 8 },
    { id: 23, label: "교통", count: 6 },
    { id: 24, label: "공급망", count: 5 },
    { id: 25, label: "문화행사", count: 4 },
  ];

  const keywordArticles = {
    AI: [
      {
        id: "ai-1",
        title: "AI 서비스 확산… 개인정보·보안 기준 강화",
        category: "IT/과학",
        date: "2026-02-03",
        summary: "AI 서비스 확산에 따라 개인정보 보호 기준이 강화되는 추세입니다.",
      },
      {
        id: "ai-2",
        title: "클라우드 비용 최적화… 기업 IT 전략 재정비",
        category: "IT/과학",
        date: "2026-02-01",
        summary: "클라우드 비용 최적화 전략이 기업 IT 로드맵의 핵심이 되고 있습니다.",
      },
    ],
    금리: [
      {
        id: "rate-1",
        title: "금리 동결 전망 속 시장 관망세",
        category: "경제",
        date: "2026-02-02",
        summary: "금리 동결 가능성이 높아지며 시장 관망세가 이어지고 있습니다.",
      },
    ],
    교통: [
      {
        id: "traffic-1",
        title: "도심 교통 혼잡 완화 대책… 수요 분산",
        category: "사회",
        date: "2026-01-31",
        summary: "대중교통 확대와 수요 분산 정책이 추진되고 있습니다.",
      },
    ],
    공급망: [
      {
        id: "supply-1",
        title: "글로벌 공급망 재편… 산업 경쟁 지형 변화",
        category: "국제",
        date: "2026-01-30",
        summary: "공급망 재편으로 산업 경쟁 구도가 빠르게 변하고 있습니다.",
      },
    ],
    문화행사: [
      {
        id: "culture-1",
        title: "공연·전시 수요 회복… 지역 문화행사 활기",
        category: "문화",
        date: "2026-01-29",
        summary: "지역 문화행사가 다시 활성화되는 흐름입니다.",
      },
    ],
  };


  const trendingItems = [
    {
      id: "trend-1",
      title: "생성형 AI 경쟁 심화로 모델 성능·비용 최적화 관련",
      category: "IT/과학",
      views: "12.4k",
    },
    {
      id: "trend-2",
      title: "금리 변동성 확대, 유통 업계 판매 전략 조정",
      category: "경제",
      views: "9.8k",
    },
    {
      id: "trend-3",
      title: "도시 교통 혼잡 완화 대책, 대중교통 확대 수요 분산",
      category: "사회",
      views: "8.1k",
    },
    {
      id: "trend-4",
      title: "기업 클라우드 이전 가속화, 보안 기준 재정립",
      category: "IT/과학",
      views: "6.7k",
    },
  ];

const listItems = activeTab === "saved" ? savedItems : recentItems;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
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
            onClick={() => setActiveTab(t.key)}
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

      {activeTab !== "keywords" && (
        <div className="archive-list">
          {filtered.map((item) => (
            <article key={item.id} className="archive-item">
              <div className="archive-item-head">
                <span className="archive-item-cat">{item.category}</span>
                <span className="archive-item-date">{item.date}</span>
              </div>
              <div className="archive-item-title">{item.title}</div>
              <div className="archive-item-summary">{item.summary}</div>
            </article>
          ))}
          {filtered.length === 0 && <div className="archive-empty">검색 결과가 없습니다.</div>}
        </div>
      )}

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
          
          <SideMenuCard />
<div className="archive-side-card">
            <div className="archive-side-head">
              <div>                <div className="archive-side-title">
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
