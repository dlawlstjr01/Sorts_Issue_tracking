import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIssues } from "../../api/newsApi";
import SideMenuCard from "../../components/SideMenuCard";

const FILTERS = ["전체", "정책", "산업", "경제", "규제"];
const CATEGORY_OPTIONS = FILTERS.filter((item) => item !== "전체");
const STATUS_OPTIONS = ["모니터링", "분석중", "요약완료"];

const CUSTOM_ISSUES_KEY = "customIssues";
const GENERATED_REPORTS_KEY = "generatedReports";
const PAGE_SIZE = 10;

function priorityByCategory(category) {
  if (category === "정책") return "높음";
  if (category === "경제" || category === "규제") return "중간";
  return "낮음";
}

function severityByStatus(status) {
  if (status === "분석중") return "위험";
  if (status === "모니터링") return "경고";
  return "보통";
}

function readLocalArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextIssueId(issues) {
  const max = (issues || []).reduce((acc, item) => {
    const matched = String(item?.id || "").match(/^ISS-(\d+)$/);
    const num = matched ? Number(matched[1]) : 0;
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);

  return `ISS-${String(max + 1).padStart(3, "0")}`;
}

function buildIssueDetail(summary, category, keywords = []) {
  return {
    why: `${category} 관련 이슈가 새롭게 등록되어 배경 맥락을 수집 중입니다.`,
    now: summary,
    next: "후속 데이터와 기사 근거를 연결해 상세 분석을 보강할 예정입니다.",
    summary,
    highlights: ["초기 이슈 등록", "담당자 검토 필요", "근거 기사 연결 예정"],
    timeline: [{ time: "지금", event: "사용자 이슈 등록", source: "수동 입력" }],
    evidence: [{ sum: "등록된 요약 기반", ev: summary, source: "사용자 입력" }],
    keywords: Array.isArray(keywords) ? keywords : [category, "신규 이슈"],
  };
}

function buildGeneratedReport(issue, type) {
  const generatedAt = Date.now();
  const reportId = `REP-${String(generatedAt).slice(-6)}`;

  const highlights = [
    `이슈 ${issue.id} 핵심: ${issue.title}`,
    `현재 상태: ${issue.status}, 우선순위: ${issue.priority}`,
    `카테고리: ${issue.category}`,
    issue.related_count ? `연관 기사 수: ${issue.related_count}` : null,
  ].filter(Boolean);

  return {
    id: reportId,
    type,
    createdAt: new Date(generatedAt).toLocaleString("ko-KR"),
    issueId: issue.id,
    issueSummaryId: issue.issue_summary_id || null,
    articleId: issue.article_id || null,
    title: `[${type}] ${issue.title}`,
    summary: issue.summary,
    body: [
      `${issue.title} 관련 핵심 내용을 정리한 ${type} 초안입니다.`,
      "",
      "1. 핵심 요약",
      issue.summary || "요약 데이터가 없습니다.",
      "",
      issue.background ? `배경: ${issue.background}` : "",
      issue.keywords ? `키워드: ${issue.keywords}` : "",
      issue.related_count ? `연관 기사 수: ${issue.related_count}` : "",
      "",
      "2. 현재 상태",
      `- 상태: ${issue.status}`,
      `- 카테고리: ${issue.category}`,
      `- 우선순위: ${issue.priority}`,
      `- 위험도: ${issue.severity}`,
      "",
      "3. 주요 포인트",
      ...highlights.map((item) => `- ${item}`),
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function parseKeywords(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBackendIssue(item) {
  const category = item?.category || "산업";
  const status = item?.status || "요약완료";
  const summary =
    item?.summary ||
    item?.short_summary ||
    item?.ultra_short ||
    item?.background ||
    "요약 내용이 없습니다.";
  const keywords = parseKeywords(item?.keywords);

  return {
    id: item?.issue_summary_id || item?.id,
    issue_summary_id: item?.issue_summary_id || item?.id || null,
    article_id: item?.article_id ?? null,
    title: item?.title || "제목 없음",
    summary,
    short_summary: item?.short_summary || "",
    ultra_short: item?.ultra_short || "",
    background: item?.background || "",
    keywords: item?.keywords || "",
    keywordList: keywords,
    related_count: Number(item?.related_count || 0),
    category,
    status,
    updatedAt: item?.updatedAt || "-",
    priority: item?.priority || priorityByCategory(category),
    severity: item?.severity || severityByStatus(status),
    press_name: item?.press_name || "언론사 미상",
    detail: item?.detail || buildIssueDetail(summary, category, keywords),
    isCustom: false,
  };
}

function normalizeCustomIssue(item) {
  const category = item?.category || "산업";
  const status = item?.status || "모니터링";
  const summary = item?.summary || "요약 내용이 없습니다.";

  return {
    id: item?.id,
    issue_summary_id: item?.issue_summary_id || null,
    article_id: item?.article_id || null,
    title: item?.title || "제목 없음",
    summary,
    short_summary: summary,
    ultra_short: "",
    background: "",
    keywords: item?.keywords || "",
    keywordList: parseKeywords(item?.keywords),
    related_count: Number(item?.related_count || 0),
    category,
    status,
    updatedAt: item?.updatedAt || "오늘",
    priority: item?.priority || priorityByCategory(category),
    severity: item?.severity || severityByStatus(status),
    press_name: item?.press_name || "직접 등록",
    detail:
      item?.detail ||
      buildIssueDetail(summary, category, parseKeywords(item?.keywords)),
    isCustom: true,
  };
}

function getCategoryCount(items, category) {
  if (category === "전체") return items.length;
  return items.filter((item) => item.category === category).length;
}

function getVisiblePages(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function IssuesPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("전체");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quickToast, setQuickToast] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: "",
    summary: "",
    category: CATEGORY_OPTIONS[0],
    status: STATUS_OPTIONS[0],
  });
  const [issueFormError, setIssueFormError] = useState("");

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    issueId: "",
    type: "이슈 리포트",
  });
  const [reportFormError, setReportFormError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchAllIssues = async () => {
      try {
        setLoading(true);
        setError("");

        const seed = await getIssues();
        const backendIssues = Array.isArray(seed)
          ? seed.map(normalizeBackendIssue)
          : [];

        const customIssues = readLocalArray(CUSTOM_ISSUES_KEY).map(normalizeCustomIssue);

        if (mounted) {
          setIssues([...customIssues, ...backendIssues]);
        }
      } catch (err) {
        console.error("이슈 데이터 조회 실패:", err);
        if (mounted) setError("이슈 데이터를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllIssues();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...issues]
      .filter((issue) => {
        const categoryMatch = filter === "전체" || issue.category === filter;
        const textMatch =
          !q ||
          String(issue.title || "").toLowerCase().includes(q) ||
          String(issue.summary || "").toLowerCase().includes(q) ||
          String(issue.id || "").toLowerCase().includes(q) ||
          String(issue.article_id || "").toLowerCase().includes(q) ||
          String(issue.press_name || "").toLowerCase().includes(q) ||
          String(issue.keywords || "").toLowerCase().includes(q);

        return categoryMatch && textMatch;
      })
      .sort((a, b) => {
        const aCount = Number(a?.related_count || 0);
        const bCount = Number(b?.related_count || 0);

        // 연관기사 수 많은 순 정렬
        if (bCount !== aCount) return bCount - aCount;

        // 같으면 최신 이슈가 위로 오도록 보조 정렬
        return String(b?.updatedAt || "").localeCompare(String(a?.updatedAt || ""));
      });
  }, [issues, query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pagedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, currentPage]);

  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages, 5),
    [currentPage, totalPages]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const submitSearch = (event) => {
    event?.preventDefault?.();
    setQuery(searchInput.trim());
  };

  const selectedReportIssue = useMemo(
    () => issues.find((item) => String(item.id) === String(reportForm.issueId)) || null,
    [issues, reportForm.issueId]
  );

  const summarySnapshot = useMemo(() => {
    if (!issues.length) {
      return {
        keywords: "데이터 없음",
        sentiment: "데이터 없음",
        sectors: "데이터 없음",
      };
    }

    const categories = [...new Set(issues.map((item) => item.category).filter(Boolean))];
    const presses = [...new Set(issues.map((item) => item.press_name).filter(Boolean))];

    return {
      keywords: categories.slice(0, 3).join(" · ") || "데이터 없음",
      sentiment: "요약완료 중심",
      sectors: presses.slice(0, 3).join(" · ") || "데이터 없음",
    };
  }, [issues]);

  const closeIssueModal = () => {
    setIssueModalOpen(false);
    setIssueFormError("");
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportFormError("");
  };

  const openIssueModal = () => {
    setIssueForm({
      title: "",
      summary: "",
      category: CATEGORY_OPTIONS[0],
      status: STATUS_OPTIONS[0],
    });
    setIssueFormError("");
    setIssueModalOpen(true);
  };

  const openReportModal = () => {
    if (issues.length === 0) {
      setQuickToast("생성할 이슈가 없어 먼저 이슈를 등록해 주세요.");
      return;
    }

    setReportForm({
      issueId: String(issues[0].id),
      type: "이슈 리포트",
    });
    setReportFormError("");
    setReportModalOpen(true);
  };

  const submitIssue = (event) => {
    event.preventDefault();

    const title = issueForm.title.trim();
    const summary = issueForm.summary.trim();

    if (!title || !summary) {
      setIssueFormError("제목과 요약은 반드시 입력해 주세요.");
      return;
    }

    const newIssue = {
      id: nextIssueId(issues),
      issue_summary_id: null,
      article_id: null,
      title,
      summary,
      short_summary: summary,
      ultra_short: "",
      background: "",
      keywords: "",
      keywordList: [],
      related_count: 0,
      category: issueForm.category,
      status: issueForm.status,
      updatedAt: "오늘",
      priority: priorityByCategory(issueForm.category),
      severity: severityByStatus(issueForm.status),
      press_name: "직접 등록",
      detail: buildIssueDetail(summary, issueForm.category, []),
      isCustom: true,
    };

    setIssues((prev) => [newIssue, ...prev]);

    const savedCustom = readLocalArray(CUSTOM_ISSUES_KEY);
    writeLocalArray(CUSTOM_ISSUES_KEY, [newIssue, ...savedCustom]);

    setFilter("전체");
    setQuery("");
    setSearchInput("");
    closeIssueModal();
    setQuickToast(`${newIssue.id} 이슈가 등록되었습니다.`);
  };

  const submitReport = (event) => {
    event.preventDefault();

    if (!reportForm.issueId) {
      setReportFormError("리포트로 만들 이슈를 선택해 주세요.");
      return;
    }

    const issue = issues.find((item) => String(item.id) === String(reportForm.issueId));
    if (!issue) {
      setReportFormError("선택한 이슈를 찾지 못했습니다. 다시 선택해 주세요.");
      return;
    }

    const generated = buildGeneratedReport(issue, reportForm.type);
    const savedReports = readLocalArray(GENERATED_REPORTS_KEY);
    writeLocalArray(GENERATED_REPORTS_KEY, [generated, ...savedReports]);

    closeReportModal();
    setQuickToast(`${generated.id} 리포트 초안을 생성했습니다.`);
    navigate(`/?view=reports&generated=${encodeURIComponent(generated.id)}`);
  };

  const handleMoveDetail = (issue) => {
    const articleId = issue?.article_id;

    if (!articleId) {
      alert("이 이슈에 연결된 기사 본문 ID가 없습니다.");
      return;
    }

    navigate(`/?view=article&id=${articleId}`);
  };

  useEffect(() => {
    if (!issueModalOpen && !reportModalOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (issueModalOpen) closeIssueModal();
      if (reportModalOpen) closeReportModal();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [issueModalOpen, reportModalOpen]);

  useEffect(() => {
    if (!quickToast) return undefined;
    const timer = window.setTimeout(() => setQuickToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [quickToast]);

  const openDetailModal = (issue) => {
    setSelectedIssue(issue);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedIssue(null);
  };

  return (
    <div className="page issues-page">
      <div className="issues-hero">
        <div>
          <div className="pageTitle">이슈 추적</div>
          <div className="pageDesc">핵심 이슈를 빠르게 추적하고 우선순위를 정리합니다.</div>
        </div>

        <div className="issues-stats issues-stats-single">
          <div className="issues-stat">
            <div className="issues-stat-label">전체 이슈</div>
            <div className="issues-stat-value">{issues.length}건</div>
          </div>
        </div>
      </div>

      <div className="issues-toolbar">
        <form className="issues-search" onSubmit={submitSearch}>
          <input
            className="issues-input"
            type="text"
            placeholder="이슈 제목, 요약, ID로 검색"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button className="issues-search-btn" type="submit">
            검색
          </button>
        </form>
      </div>

      <div className="issues-grid">
        <section className="issues-list">
          <div className="issues-list-head">
            <div className="issues-list-summary">
              전체 <strong>{filtered.length}</strong>건
              <span className="issues-list-divider">|</span>
              페이지 <strong>{currentPage}</strong> / {totalPages}
            </div>
          </div>

          {loading ? (
            <div className="issues-empty">불러오는 중...</div>
          ) : error ? (
            <div className="issues-empty">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="issues-empty">조건에 맞는 이슈가 없습니다.</div>
          ) : (
            <>
              {pagedIssues.map((issue) => (
                <article
                  key={`${issue.id}-${issue.issue_summary_id || "custom"}`}
                  className="issue-card"
                >
                  <button
                    type="button"
                    className="issues-card-button"
                    onClick={() => openDetailModal(issue)}
                  >
                    <div className="issue-card-top">
                      <div className="issue-badges">
                        <span className="issue-id">
                          {issue.issue_summary_id ? `ISSUE-${issue.issue_summary_id}` : issue.id}
                        </span>

                        <span
                          className={`issue-pill issue-status ${issue.status === "모니터링"
                            ? "monitor"
                            : issue.status === "분석중"
                              ? "analysis"
                              : "done"
                            }`}
                        >
                          {issue.status}
                        </span>

                        <span className="issue-category">{issue.category}</span>

                        <span
                          className={`issue-priority ${issue.priority === "높음"
                            ? "high"
                            : issue.priority === "중간"
                              ? "mid"
                              : "low"
                            }`}
                        >
                          우선순위 {issue.priority}
                        </span>

                        <span
                          className={`issue-severity ${issue.severity === "위험"
                            ? "danger"
                            : issue.severity === "경고"
                              ? "warn"
                              : "normal"
                            }`}
                        >
                          위험도 {issue.severity}
                        </span>
                      </div>

                      <div className="issue-date">{issue.updatedAt}</div>
                    </div>

                    <div className="issue-title">{issue.title}</div>
                    <div className="issue-summary">{issue.summary}</div>

                    {!!issue.keywordList?.length && (
                      <div className="issue-keywords">
                        {issue.keywordList.slice(0, 5).map((keyword, index) => (
                          <span key={`${issue.id}-kw-${index}`} className="issue-keyword">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="issue-card-foot">
                      <div className="issue-foot-left">
                        <span>언론사: {issue.press_name}</span>
                        {issue.related_count > 0 && <span>연관 기사 수: {issue.related_count}</span>}
                      </div>

                      <button
                        type="button"
                        className="issue-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(issue);
                        }}
                      >
                        상세 보기
                      </button>
                    </div>
                  </button>
                </article>
              ))}

              {detailModalOpen && selectedIssue && (
                <div className="archive-detail-backdrop" onClick={closeDetailModal}>
                  <div
                    className="archive-detail-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="archive-detail-top">
                      <span className="archive-detail-category">
                        {selectedIssue.category || "기타"}
                      </span>
                      <span className="archive-detail-date">
                        {selectedIssue.updatedAt || "-"}
                      </span>
                    </div>

                    <div className="archive-detail-title">
                      {selectedIssue.title}
                    </div>

                    <div className="archive-detail-summary">
                      {selectedIssue.summary}
                    </div>

                    {!!selectedIssue.keywordList?.length && (
                      <div className="archive-detail-keywords">
                        {selectedIssue.keywordList.map((keyword, index) => (
                          <span
                            key={`${selectedIssue.id}-detail-kw-${index}`}
                            className="archive-detail-keyword"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="archive-detail-divider" />

                    <div className="archive-detail-actions">
                      <button
                        type="button"
                        className="archive-detail-btn primary"
                        onClick={() => {
                          closeDetailModal();
                          handleMoveDetail(selectedIssue);
                        }}
                      >
                        본문 보기
                      </button>

                      <button
                        type="button"
                        className="archive-detail-btn"
                        onClick={closeDetailModal}
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="issues-pagination">
                <button
                  type="button"
                  className="issues-page-btn nav"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </button>

                {visiblePages[0] > 1 && (
                  <>
                    <button
                      type="button"
                      className={`issues-page-btn ${currentPage === 1 ? "active" : ""}`}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                    {visiblePages[0] > 2 && (
                      <span className="issues-page-ellipsis">...</span>
                    )}
                  </>
                )}

                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`issues-page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {visiblePages[visiblePages.length - 1] < totalPages && (
                  <>
                    {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                      <span className="issues-page-ellipsis">...</span>
                    )}
                    <button
                      type="button"
                      className={`issues-page-btn ${currentPage === totalPages ? "active" : ""}`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="issues-page-btn nav"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </button>
              </div>
            </>
          )}
        </section>

        <aside className="issues-side">
          <div className="issues-panel">
            <div className="issues-panel-title">요약 스냅샷</div>
            <div className="issues-summary-list">
              <div className="issues-summary-item">
                <div className="issues-summary-label">핵심 카테고리</div>
                <div className="issues-summary-value">{summarySnapshot.keywords}</div>
              </div>
              <div className="issues-summary-item">
                <div className="issues-summary-label">상태 요약</div>
                <div className="issues-summary-value">{summarySnapshot.sentiment}</div>
              </div>
              <div className="issues-summary-item">
                <div className="issues-summary-label">주요 언론사</div>
                <div className="issues-summary-value">{summarySnapshot.sectors}</div>
              </div>
            </div>
          </div>

          <SideMenuCard collapsible showScrollTop />
        </aside>
      </div>

      {issueModalOpen && (
        <div className="issues-modal-backdrop" onClick={closeIssueModal}>
          <div className="issues-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issues-modal-title">신규 이슈 등록</div>

            <form onSubmit={submitIssue} className="issues-form">
              <input
                className="issues-input"
                type="text"
                placeholder="이슈 제목"
                value={issueForm.title}
                onChange={(e) =>
                  setIssueForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />

              <textarea
                className="issues-textarea"
                placeholder="이슈 요약"
                value={issueForm.summary}
                onChange={(e) =>
                  setIssueForm((prev) => ({ ...prev, summary: e.target.value }))
                }
              />

              <div className="issues-form-row">
                <select
                  className="issues-select"
                  value={issueForm.category}
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  {CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  className="issues-select"
                  value={issueForm.status}
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {issueFormError ? (
                <div className="issues-form-error">{issueFormError}</div>
              ) : null}

              <div className="issues-modal-actions">
                <button type="button" className="issues-btn secondary" onClick={closeIssueModal}>
                  취소
                </button>
                <button type="submit" className="issues-btn primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reportModalOpen && (
        <div className="issues-modal-backdrop" onClick={closeReportModal}>
          <div className="issues-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issues-modal-title">요약 리포트 생성</div>

            <form onSubmit={submitReport} className="issues-form">
              <select
                className="issues-select"
                value={reportForm.issueId}
                onChange={(e) =>
                  setReportForm((prev) => ({ ...prev, issueId: e.target.value }))
                }
              >
                {issues.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.title}
                  </option>
                ))}
              </select>

              <select
                className="issues-select"
                value={reportForm.type}
                onChange={(e) =>
                  setReportForm((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="이슈 리포트">이슈 리포트</option>
                <option value="브리핑 노트">브리핑 노트</option>
                <option value="상황 보고서">상황 보고서</option>
              </select>

              {selectedReportIssue && (
                <div className="issues-report-preview">
                  <div className="issues-report-preview-title">{selectedReportIssue.title}</div>
                  <div className="issues-report-preview-summary">
                    {selectedReportIssue.summary}
                  </div>
                </div>
              )}

              {reportFormError ? (
                <div className="issues-form-error">{reportFormError}</div>
              ) : null}

              <div className="issues-modal-actions">
                <button
                  type="button"
                  className="issues-btn secondary"
                  onClick={closeReportModal}
                >
                  취소
                </button>
                <button type="submit" className="issues-btn primary">
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {quickToast ? <div className="issues-toast">{quickToast}</div> : null}
    </div>
  );
}