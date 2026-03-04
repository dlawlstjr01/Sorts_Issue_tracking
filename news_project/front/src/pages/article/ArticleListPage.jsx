import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchNews } from "../../api/newsApi";
import "../../CSS/common.css";
import "../../CSS/main.css";
import "../../CSS/sub.css";

const PAGE_SIZE = 30;

const FILTER_TABS = [
  { key: "period", label: "기간" },
  { key: "press", label: "언론사" },
];

const PRESS_GROUPS = [
  "종합일간지",
  "경제지",
  "방송/통신",
  "디지털/전문지",
  "지역지",
];

const PRESS_ITEMS = [
  "조선일보",
  "중앙일보",
  "동아일보",
  "한겨레",
  "경향신문",
  "한국일보",
  "서울신문",
  "국민일보",
  "세계일보",
  "문화일보",
  "매일경제",
  "한국경제",
  "서울경제",
  "파이낸셜뉴스",
  "머니투데이",
  "이데일리",
  "아시아경제",
  "헤럴드경제",
  "연합뉴스",
  "뉴시스",
  "KBS",
  "MBC",
  "SBS",
  "YTN",
  "JTBC",
  "TV조선",
  "채널A",
  "MBN",
  "오마이뉴스",
  "프레시안",
  "미디어오늘",
  "디지털타임스",
  "전자신문",
  "ZDNET Korea",
  "부산일보",
  "매일신문",
  "강원일보",
  "경인일보",
  "노컷뉴스",
  "뉴스1",
  "뉴스핌",
  "데일리안",
  "아이뉴스24",
  "이코노미스트",
  "매경이코노미",
  "주간조선",
  "주간동아",
  "시사IN",
  "한겨레21",
  "시사저널",
  "주간경향",
  "폴리뉴스",
  "서울파이낸스",
  "비즈니스포스트",
  "더벨",
  "블로터",
  "디지털데일리",
  "헬로디디",
  "보안뉴스",
  "더팩트",
  "머니S",
  "뉴스토마토",
  "아주경제",
  "브릿지경제",
  "비즈워치",
  "조세일보",
  "한국세정신문",
  "인더스트리뉴스",
  "메디칼타임즈",
  "청년의사",
  "약업신문",
  "의학신문",
  "KNN",
  "TBC",
  "CJB",
  "JTV",
  "ubc울산방송",
  "G1방송",
  "KBC광주방송",
  "TJB대전방송",
  "OBS경인TV",
  "연합뉴스TV",
  "KBS부산",
  "KBS대구",
  "KBS광주",
  "KBS전주",
  "KBS청주",
  "KBS춘천",
  "KBS제주",
  "국제신문",
  "대구일보",
  "전북일보",
  "전남일보",
  "광주일보",
  "충청일보",
  "충청타임즈",
  "중부일보",
  "한라일보",
  "제민일보",
  "기호일보",
  "경기일보",
  "강원도민일보",
  "충북일보",
  "대전일보",
  "중도일보",
  "경상일보",
  "영남일보",
  "경남신문",
  "경남도민일보",
  "전북도민일보",
  "경북일보",
  "광남일보",
  "무등일보",
  "남도일보",
  "농민신문",
  "축산신문",
  "해양수산신문",
  "스포츠서울",
  "스포츠경향",
  "스포티비뉴스",
  "OSEN",
  "마이데일리",
  "엑스포츠뉴스",
  "스타뉴스",
  "스포츠동아",
  "일간스포츠",
  "텐아시아",
  "TV리포트",
  "뉴스엔",
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
  const [selectedPressGroup, setSelectedPressGroup] = useState(() => new Set(["종합일간지"]));
  const [selectedPress, setSelectedPress] = useState(() => new Set(["조선일보"]));
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - 3);
    return { start: formatDate(start), end: formatDate(end) };
  });

  const [newsItems, setNewsItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpWrapRef = useRef(null);

  const selectedCount =
    selectedPressGroup.size +
    selectedPress.size +
    (query.trim() ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const visiblePages = useMemo(() => {
    const maxButtons = 5;
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

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
      const items = Array.isArray(data.items) ? data.items : [];
      setNewsItems(items);
      setTotal(Number(data.total) || 0);
      setCurrentPage(targetPage);
    } catch (err) {
      setError(err?.response?.data?.message || "뉴스 기사를 불러오지 못했습니다.");
      setNewsItems([]);
      setTotal(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(1, "", dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHelpOpen) return;

    const handleOutsideClick = (event) => {
      if (helpWrapRef.current && !helpWrapRef.current.contains(event.target)) {
        setIsHelpOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsHelpOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isHelpOpen]);

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

  const applyQuickRange = (unit, amount) => {
    const end = new Date();
    const start = new Date(end);
    if (unit === "day") start.setDate(start.getDate() - amount);
    if (unit === "month") start.setMonth(start.getMonth() - amount);
    setDateRange({ start: formatDate(start), end: formatDate(end) });
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

  const handlePageChange = async (targetPage) => {
    if (loading) return;
    if (targetPage < 1 || targetPage > totalPages) return;
    await loadNews(targetPage, query.trim(), dateRange);
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

            <div className="als-help-wrap" ref={helpWrapRef}>
            <button
              type="button"
              className="als-help-btn"
              onClick={() => setIsHelpOpen((prev) => !prev)}
              aria-expanded={isHelpOpen}
              aria-controls="als-help-popover"
            >
              <span className="als-help-badge">i</span>
              검색도움말
            </button>

            {isHelpOpen && (
                <div id="als-help-popover" className="als-help-popover" role="dialog" aria-label="검색 도움말">
                  <div className="als-help-popover-title">검색 도움말</div>
                  <ul className="als-help-list">
                    <li>검색어는 공백으로 여러 단어를 입력할 수 있습니다.</li>
                    <li>기간/언론사를 선택한 뒤 적용하기를 누르세요.</li>
                    <li>검색어 없이도 필터 조건만으로 검색할 수 있습니다.</li>
                  </ul>
                </div>
              )}
            </div>

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

          <div className="als-filter-body is-matrix">
            <div className="als-lane">
              <div className="als-lane-title">기간</div>
              <div className="als-date-filter compact">
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
                  <button type="button" onClick={() => applyQuickRange("day", 7)}>
                    최근 7일
                  </button>
                  <button type="button" onClick={() => applyQuickRange("month", 1)}>
                    최근 1개월
                  </button>
                  <button type="button" onClick={() => applyQuickRange("month", 3)}>
                    최근 3개월
                  </button>
                </div>
              </div>
            </div>

            <div className="als-lane">
              <div className="als-lane-title">언론사</div>
              <div className="als-lane-chip-wrap">
                {PRESS_GROUPS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`als-chip-btn ${selectedPressGroup.has(name) ? "active" : ""}`}
                    onClick={() => togglePressGroup(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="als-lane-chip-wrap als-press-chip-wrap">
                {PRESS_ITEMS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`als-chip-btn sub ${selectedPress.has(name) ? "active" : ""}`}
                    onClick={() => togglePress(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
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
          <div className="als-news-head-meta">
            <div className="als-news-visible">페이지 {currentPage}/{totalPages}</div>
            <div className="als-news-visible">현재 {newsItems.length}개 표시</div>
            <div className="als-news-total">총 {total}건</div>
          </div>
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                이전
              </button>

              {visiblePages.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`als-page-btn ${num === currentPage ? "active" : ""}`}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className="als-page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
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
