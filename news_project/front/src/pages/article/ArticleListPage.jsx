import React, { useEffect, useMemo, useState } from "react";
import { fetchNews } from "../../api/newsApi";
import "../../CSS/articleList.css";

const PAGE_SIZE = 6;

const FILTER_TABS = [
  { key: "period", label: "기간" },
  { key: "press", label: "언론사" },
  { key: "category", label: "통합 분류" },
  { key: "incident", label: "사건사고 분류" },
  { key: "detail", label: "상세검색" },
];

const PRESS_GROUPS = [
  "전국일간지",
  "경제일간지",
  "지역일간지",
  "지역주간지",
  "방송사",
];

const PRESS_ITEMS = [
  "매일신문",
  "부동일보",
  "부산일보",
  "새전북신문",
  "영남일보",
  "춘천매일",
  "울산신문",
  "인천일보",
  "전남일보",
  "전라일보",
  "전북도민일보",
  "전북일보",
  "제민일보",
  "제주일보",
  "중도일보",
  "중부매일",
  "중부일보",
  "충북일보",
  "충청일보",
  "충청타임즈",
  "충청투데이",
  "한라일보",
  "당진시대",
  "설악신문",
  "영주시민신문",
  "평택시민신문",
  "홍성신문",
  "KBS",
  "MBC",
  "OBS",
  "SBS",
  "YTN",
  "기자협회보",
  "디지털타임스",
  "미디어오늘",
  "소년한국일보",
];

const THUMB_FALLBACK =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPublishedDate(raw) {
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw).slice(0, 10);
  return formatDate(parsed);
}

export default function ArticleListPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("period");
  const [selectedPressGroup, setSelectedPressGroup] = useState(() => new Set(["전국일간지"]));
  const [selectedPress, setSelectedPress] = useState(() => new Set(["매일신문"]));
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - 3);
    return { start: formatDate(start), end: formatDate(end) };
  });

  const [newsItems, setNewsItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCount = selectedPressGroup.size + selectedPress.size + (query.trim() ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const visiblePages = useMemo(() => {
    const maxButtons = 5;
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const loadNews = async (targetPage, keyword, range = dateRange) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchNews({
        page: targetPage,
        size: PAGE_SIZE,
        q: keyword || undefined,
        dateFrom: range?.start,
        dateTo: range?.end,
      });

      const data = response?.data || {};
      setNewsItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total) || 0);
      setPage(targetPage);
    } catch (err) {
      setError(err?.response?.data?.message || "뉴스 기사를 불러오지 못했습니다.");
      setNewsItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(1, "", dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePressGroup = (name) => {
    setSelectedPressGroup((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const togglePress = (name) => {
    setSelectedPress((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const resetFilters = async () => {
    setQuery("");
    setSelectedPressGroup(new Set());
    setSelectedPress(new Set());
    const end = new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - 3);
    const nextRange = { start: formatDate(start), end: formatDate(end) };
    setDateRange(nextRange);
    await loadNews(1, "", nextRange);
  };

  const runSearch = async () => {
    if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) {
      setError("시작일이 종료일보다 늦습니다.");
      return;
    }
    await loadNews(1, query.trim(), dateRange);
  };

  return (
    <div className="page article-search-page">
      <section className="als-step-card">
        <div className="als-step-head step-1">
          <span className="als-step-title">뉴스 검색</span>
        </div>

        <div className="als-step-body">
          <div className="als-search-row">
            <label className="als-search-input">
              <span className="als-search-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path
                    d="M10.5 3a7.5 7.5 0 0 1 5.95 12.07l4.24 4.24-1.42 1.42-4.24-4.24A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="기본 검색어를 입력하세요."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <button type="button" className="als-help-btn">
              <span className="als-help-badge">i</span>
              검색도움말
            </button>
          </div>

          <div className="als-tab-row">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`als-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="als-tab-mark">{activeTab === tab.key ? "+" : "−"}</span>
              </button>
            ))}
          </div>

          <div className="als-filter-body">
            {activeTab === "period" ? (
              <div className="als-date-filter">
                <div className="als-date-row">
                  <label className="als-date-field">
                    <span>시작일</span>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(event) =>
                        setDateRange((prev) => ({ ...prev, start: event.target.value }))
                      }
                    />
                  </label>
                  <span className="als-date-sep">~</span>
                  <label className="als-date-field">
                    <span>종료일</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(event) =>
                        setDateRange((prev) => ({ ...prev, end: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="als-date-quick">
                  <button
                    type="button"
                    onClick={() => {
                      const end = new Date();
                      const start = new Date(end);
                      start.setDate(start.getDate() - 7);
                      setDateRange({ start: formatDate(start), end: formatDate(end) });
                    }}
                  >
                    최근 7일
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const end = new Date();
                      const start = new Date(end);
                      start.setMonth(start.getMonth() - 1);
                      setDateRange({ start: formatDate(start), end: formatDate(end) });
                    }}
                  >
                    최근 1개월
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const end = new Date();
                      const start = new Date(end);
                      start.setMonth(start.getMonth() - 3);
                      setDateRange({ start: formatDate(start), end: formatDate(end) });
                    }}
                  >
                    최근 3개월
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="als-filter-groups">
                  {PRESS_GROUPS.map((name) => (
                    <label key={name} className="als-check-row">
                      <input
                        type="checkbox"
                        checked={selectedPressGroup.has(name)}
                        onChange={() => togglePressGroup(name)}
                      />
                      <span>{name}</span>
                      {(name === "지역일간지" || name === "지역주간지") && (
                        <button type="button" className="als-inline-plus" aria-label={`${name} 펼치기`}>
                          +
                        </button>
                      )}
                    </label>
                  ))}
                </div>

                <div className="als-filter-press">
                  {PRESS_ITEMS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`als-press-item ${selectedPress.has(name) ? "active" : ""}`}
                      onClick={() => togglePress(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="als-selected-row">
            <div className="als-selected-chip">
              {dateRange.start} ~ {dateRange.end}
              <button
                type="button"
                className="als-chip-remove"
                onClick={() => {
                  const end = new Date();
                  const start = new Date(end);
                  start.setMonth(start.getMonth() - 3);
                  setDateRange({ start: formatDate(start), end: formatDate(end) });
                }}
                aria-label="기간 초기화"
              >
                ×
              </button>
            </div>

            <div className="als-selected-count">선택 {selectedCount}</div>

            <div className="als-actions">
              <button type="button" className="als-btn ghost" onClick={resetFilters}>
                초기화
              </button>
              <button type="button" className="als-btn primary" onClick={runSearch} disabled={loading}>
                {loading ? "검색 중..." : "적용하기"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="als-news-wrap">
        <div className="als-news-head">
          <div className="als-news-title-main">뉴스 기사</div>
          <div className="als-news-total">총 {total}건</div>
        </div>

        {loading && <div className="als-empty">뉴스를 불러오는 중입니다...</div>}
        {!loading && error && <div className="als-empty is-error">{error}</div>}
        {!loading && !error && newsItems.length === 0 && (
          <div className="als-empty">표시할 뉴스 기사가 없습니다.</div>
        )}

        {!loading && !error && newsItems.length > 0 && (
          <>
            <div className="als-news-grid">
              {newsItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url || "#"}
                  target={item.url ? "_blank" : undefined}
                  rel={item.url ? "noreferrer noopener" : undefined}
                  className="als-news-card"
                >
                  <div className="als-news-thumb-wrap">
                    <img src={item.thumbnail || THUMB_FALLBACK} alt="" loading="lazy" />
                  </div>
                  <div className="als-news-body">
                    <div className="als-news-meta">
                      <span className="als-news-cat">{item.category || "기타"}</span>
                      <span className="als-news-date">
                        {formatPublishedDate(item.published_at || item.created_at)}
                      </span>
                    </div>
                    <div className="als-news-item-title">{item.title || "제목 없음"}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="als-pagination">
              <button
                type="button"
                className="als-page-btn"
                onClick={() => loadNews(page - 1, query.trim(), dateRange)}
                disabled={page <= 1}
              >
                이전
              </button>

              {visiblePages.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`als-page-btn ${num === page ? "active" : ""}`}
                  onClick={() => loadNews(num, query.trim(), dateRange)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className="als-page-btn"
                onClick={() => loadNews(page + 1, query.trim(), dateRange)}
                disabled={page >= totalPages}
              >
                다음
              </button>
            </div>
          </>
        )}
      </section>

      <div className="als-floating-tools">
        <button type="button" className="als-fab primary" aria-label="빠른 메뉴">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          className="als-fab dark"
          aria-label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="m12 6 8 8-1.4 1.4L12 8.8l-6.6 6.6L4 14l8-8Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
