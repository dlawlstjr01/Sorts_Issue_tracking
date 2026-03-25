import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIssues } from "../../api/newsApi";
import SideMenuCard from "../../components/SideMenuCard";

const CATEGORY_OPTIONS = ["정치", "사회", "경제", "국제", "IT/과학", "문화", "스포츠"];
const STATUS_OPTIONS = ["모니터링", "분석중", "요약완료"];
const PAGE_SIZE = 10;

const CUSTOM_ISSUES_KEY = "customIssues";
const GENERATED_REPORTS_KEY = "generatedReports";

function safeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function parseDateValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDisplayDate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw.length >= 10 ? raw.slice(0, 10) : raw;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeCategory(value) {
  return safeText(value, "사회");
}

function normalizeStatus(value) {
  const raw = safeText(value);
  if (STATUS_OPTIONS.includes(raw)) return raw;
  if (raw.includes("분석")) return "분석중";
  if (raw.includes("모니터")) return "모니터링";
  if (raw.includes("완료") || raw.includes("요약")) return "요약완료";
  return "요약완료";
}

function priorityByCategory(category) {
  if (category === "정치") return "높음";
  if (category === "경제" || category === "국제") return "중간";
  return "낮음";
}

function severityByStatus(status) {
  if (status === "분석중") return "위험";
  if (status === "모니터링") return "경고";
  return "보통";
}

function normalizePriority(value, category) {
  const raw = safeText(value);
  if (raw.includes("높")) return "높음";
  if (raw.includes("중")) return "중간";
  if (raw.includes("낮")) return "낮음";
  return priorityByCategory(category);
}

function normalizeSeverity(value, status) {
  const raw = safeText(value);
  if (raw.includes("위")) return "위험";
  if (raw.includes("경")) return "경고";
  if (raw.includes("보")) return "보통";
  return severityByStatus(status);
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

function parseKeywords(value) {
  if (Array.isArray(value)) {
    return value.map((item) => safeText(item)).filter(Boolean);
  }

  const raw = safeText(value);
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => safeText(item)).filter(Boolean);
      }
    } catch {
      // Fall through to comma-split parsing.
    }
  }

  return raw
    .split(",")
    .map((item) => safeText(item))
    .filter(Boolean);
}

function compactSummary(value) {
  const normalized = safeText(value)
    .replace(/\r/g, "")
    .replace(/^\s*-\s*/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "요약 내용이 없습니다.";
}

function buildIssueDetail(summary, category, keywords = []) {
  return {
    why: `${category} 관련 이슈가 등록되어 배경과 맥락을 중심으로 추적 중입니다.`,
    now: summary,
    next: "관련 기사와 변화 흐름을 계속 반영해 후속 내용을 업데이트할 예정입니다.",
    summary,
    highlights: ["핵심 내용 파악", "연관 기사 추적", "후속 변화 모니터링"],
    timeline: [{ time: "지금", event: "이슈 등록 및 추적 시작", source: "이슈 추적" }],
    evidence: [{ sum: "초기 요약 기반", ev: summary, source: "대표 기사 요약" }],
    keywords: Array.isArray(keywords) && keywords.length ? keywords : [category, "핵심 이슈"],
  };
}

function buildGeneratedReport(issue, type) {
  const generatedAt = Date.now();
  const reportId = `REP-${String(generatedAt).slice(-6)}`;

  const highlights = [
    `이슈 ID: ${issue.displayId || issue.id}`,
    `현재 상태: ${issue.status}`,
    `우선순위: ${issue.priority}`,
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
    summary: issue.detailSummary || issue.summary,
    body: [
      `${issue.title} 이슈를 기준으로 작성한 ${type} 초안입니다.`,
      "",
      "1. 이슈 요약",
      issue.detailSummary || issue.summary || "요약 내용이 없습니다.",
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

function normalizeBackendIssue(item) {
  const category = normalizeCategory(item?.category);
  const status = normalizeStatus(item?.status);
  const detailSummary = safeText(
    item?.short_summary || item?.summary || item?.ultra_short || item?.background,
    "요약 내용이 없습니다."
  );
  const keywordList = parseKeywords(item?.keywords);
  const rawDate =
    item?.published_at || item?.created_at || item?.createdAt || item?.updatedAt || "";
  const issueId = item?.issue_summary_id ?? item?.id ?? Date.now();

  return {
    id: issueId,
    displayId: item?.issue_summary_id ? `ISSUE-${item.issue_summary_id}` : String(issueId),
    issue_summary_id: item?.issue_summary_id ?? item?.id ?? null,
    article_id: item?.article_id ?? null,
    title: safeText(item?.title, "제목 없음"),
    summary: compactSummary(detailSummary),
    detailSummary,
    short_summary: safeText(item?.short_summary),
    ultra_short: safeText(item?.ultra_short),
    background: safeText(item?.background),
    keywords: safeText(item?.keywords),
    keywordList,
    related_count: Number(item?.related_count || 0),
    category,
    status,
    updatedAt: formatDisplayDate(rawDate),
    sortTs: parseDateValue(rawDate),
    priority: normalizePriority(item?.priority, category),
    severity: normalizeSeverity(item?.severity, status),
    press_name: safeText(item?.press_name, "언론사 미상"),
    detail: item?.detail || buildIssueDetail(detailSummary, category, keywordList),
    isCustom: false,
  };
}

function normalizeCustomIssue(item) {
  const category = normalizeCategory(item?.category);
  const status = normalizeStatus(item?.status);
  const detailSummary = safeText(item?.summary, "요약 내용이 없습니다.");
  const rawDate = item?.updatedAt || item?.created_at || item?.createdAt || "";

  return {
    id: safeText(item?.id, nextIssueId([])),
    displayId: safeText(item?.id, "ISS-001"),
    issue_summary_id: item?.issue_summary_id || null,
    article_id: item?.article_id || null,
    title: safeText(item?.title, "제목 없음"),
    summary: compactSummary(detailSummary),
    detailSummary,
    short_summary: detailSummary,
    ultra_short: "",
    background: safeText(item?.background),
    keywords: safeText(item?.keywords),
    keywordList: parseKeywords(item?.keywords),
    related_count: Number(item?.related_count || 0),
    category,
    status,
    updatedAt: formatDisplayDate(rawDate || new Date().toISOString()),
    sortTs: parseDateValue(rawDate || new Date().toISOString()),
    priority: normalizePriority(item?.priority, category),
    severity: normalizeSeverity(item?.severity, status),
    press_name: safeText(item?.press_name, "직접 등록"),
    detail:
      item?.detail ||
      buildIssueDetail(detailSummary, category, parseKeywords(item?.keywords)),
    isCustom: true,
  };
}

function getVisiblePages(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function priorityClass(priority) {
  if (priority === "높음") return "high";
  if (priority === "중간") return "mid";
  return "low";
}

function severityClass(severity) {
  if (severity === "위험") return "danger";
  if (severity === "경고") return "warn";
  return "normal";
}

function statusClass(status) {
  if (status === "모니터링") return "monitor";
  if (status === "분석중") return "analysis";
  return "done";
}

export default function IssuesPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
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
        const backendIssues = Array.isArray(seed) ? seed.map(normalizeBackendIssue) : [];
        const customIssues = readLocalArray(CUSTOM_ISSUES_KEY).map(normalizeCustomIssue);

        if (mounted) {
          setIssues([...customIssues, ...backendIssues]);
        }
      } catch (fetchError) {
        console.error("이슈 데이터 조회 실패:", fetchError);
        if (mounted) {
          setError("이슈 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAllIssues();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredIssues = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return [...issues]
      .filter((issue) => {
        if (!keyword) return true;

        return [
          issue.title,
          issue.summary,
          issue.detailSummary,
          issue.displayId,
          issue.press_name,
          issue.keywords,
          issue.category,
        ].some((field) => String(field || "").toLowerCase().includes(keyword));
      })
      .sort((a, b) => {
        const countGap = Number(b?.related_count || 0) - Number(a?.related_count || 0);
        if (countGap !== 0) return countGap;

        const timeGap = Number(b?.sortTs || 0) - Number(a?.sortTs || 0);
        if (timeGap !== 0) return timeGap;

        return String(b?.displayId || "").localeCompare(String(a?.displayId || ""));
      });
  }, [issues, query]);

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / PAGE_SIZE));

  const pagedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredIssues.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredIssues, currentPage]);

  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages, 5),
    [currentPage, totalPages]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!quickToast) return undefined;
    const timer = window.setTimeout(() => setQuickToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [quickToast]);

  useEffect(() => {
    if (!issueModalOpen && !reportModalOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (issueModalOpen) {
        setIssueModalOpen(false);
        setIssueFormError("");
      }
      if (reportModalOpen) {
        setReportModalOpen(false);
        setReportFormError("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [issueModalOpen, reportModalOpen]);

  const selectedReportIssue = useMemo(
    () => issues.find((item) => String(item.id) === String(reportForm.issueId)) || null,
    [issues, reportForm.issueId]
  );

  const submitSearch = (event) => {
    event?.preventDefault?.();
    setQuery(searchInput.trim());
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
    setIssueFormError("");
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportFormError("");
  };

  const submitIssue = (event) => {
    event.preventDefault();

    const title = safeText(issueForm.title);
    const summary = safeText(issueForm.summary);

    if (!title || !summary) {
      setIssueFormError("제목과 요약은 반드시 입력해 주세요.");
      return;
    }

    const nowIso = new Date().toISOString();
    const newIssue = normalizeCustomIssue({
      id: nextIssueId(issues),
      title,
      summary,
      category: issueForm.category,
      status: issueForm.status,
      updatedAt: nowIso,
      press_name: "직접 등록",
    });

    setIssues((prev) => [newIssue, ...prev]);
    writeLocalArray(CUSTOM_ISSUES_KEY, [newIssue, ...readLocalArray(CUSTOM_ISSUES_KEY)]);

    setQuery("");
    setSearchInput("");
    closeIssueModal();
    setQuickToast(`${newIssue.displayId} 이슈가 등록되었습니다.`);
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
    writeLocalArray(GENERATED_REPORTS_KEY, [
      generated,
      ...readLocalArray(GENERATED_REPORTS_KEY),
    ]);

    closeReportModal();
    setQuickToast(`${generated.id} 리포트 초안이 생성되었습니다.`);
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

  const openDetailModal = (issue) => {
    setSelectedIssue(issue);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedIssue(null);
    setDetailModalOpen(false);
  };

  return (
    <div className="page issues-page">
      <div className="issues-hero">
        <div className="issues-hero-copy">
          <div className="pageTitle">이슈 추적</div>
          <div className="pageDesc">
            핵심 이슈를 빠르게 추적하고 우선순위를 정리합니다.
          </div>
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
              전체 <strong>{filteredIssues.length}</strong>건
              <span className="issues-list-divider">|</span>
              페이지 <strong>{currentPage}</strong> / {totalPages}
            </div>
          </div>

          {loading ? (
            <div className="issues-empty">불러오는 중입니다...</div>
          ) : error ? (
            <div className="issues-empty">{error}</div>
          ) : filteredIssues.length === 0 ? (
            <div className="issues-empty">조건에 맞는 이슈가 없습니다.</div>
          ) : (
            <>
              {pagedIssues.map((issue) => (
                <article
                  key={`${issue.id}-${issue.issue_summary_id || "custom"}`}
                  className="issue-card"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    className="issues-card-button"
                    onClick={() => openDetailModal(issue)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openDetailModal(issue);
                      }
                    }}
                  >
                    <div className="issue-card-top">
                      <div className="issue-badges">
                        <span className="issue-id">{issue.displayId}</span>
                        <span className={`issue-pill issue-status ${statusClass(issue.status)}`}>
                          {issue.status}
                        </span>
                        <span className="issue-category">{issue.category}</span>
                      </div>

                      <div className="issue-date">{issue.updatedAt}</div>
                    </div>

                    <div className="issue-title">{issue.title}</div>
                    <div className="issue-summary">{issue.summary}</div>

                    {!!issue.keywordList.length && (
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
                        {issue.related_count > 0 && (
                          <span>연관 기사 수: {issue.related_count}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="issue-action"
                        onClick={(event) => {
                          event.stopPropagation();
                          openDetailModal(issue);
                        }}
                      >
                        상세 보기
                      </button>
                    </div>
                  </div>
                </article>
              ))}

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
          <aside className="issues-side-ad-slot" aria-label="스폰서 광고">
            <section className="right-ad-card2">
              <div className="right-ad-tag">광고</div>
              <div className="right-ad-title">프리미엄 이슈 브리핑</div>
              <p className="right-ad-copy">
                핵심 이슈 알림과 상세 분석 리포트를 빠르게 확인해보세요.
              </p>
              <div className="right-ad-visual right-ad-visual-alt" aria-hidden="true" />
            </section>
          </aside>

          <SideMenuCard collapsible showScrollTop />
        </aside>
      </div>

      {detailModalOpen && selectedIssue && (
        <div className="archive-detail-backdrop" onClick={closeDetailModal}>
          <div className="archive-detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="archive-detail-top">
              <span className="archive-detail-category">
                {selectedIssue.category || "기타"}
              </span>
              <span className="archive-detail-date">
                {selectedIssue.updatedAt || "-"}
              </span>
            </div>

            <div className="archive-detail-title">{selectedIssue.title}</div>
            <div className="archive-detail-summary">
              {selectedIssue.detailSummary || selectedIssue.summary}
            </div>

            {!!selectedIssue.keywordList.length && (
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

      {issueModalOpen && (
        <div className="issues-modal-backdrop" onClick={closeIssueModal}>
          <div className="issues-modal" onClick={(event) => event.stopPropagation()}>
            <div className="issues-modal-title">신규 이슈 등록</div>

            <form onSubmit={submitIssue} className="issues-form">
              <input
                className="issues-input"
                type="text"
                placeholder="이슈 제목"
                value={issueForm.title}
                onChange={(event) =>
                  setIssueForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />

              <textarea
                className="issues-textarea"
                placeholder="이슈 요약"
                value={issueForm.summary}
                onChange={(event) =>
                  setIssueForm((prev) => ({ ...prev, summary: event.target.value }))
                }
              />

              <div className="issues-form-row">
                <select
                  className="issues-select"
                  value={issueForm.category}
                  onChange={(event) =>
                    setIssueForm((prev) => ({ ...prev, category: event.target.value }))
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
                  onChange={(event) =>
                    setIssueForm((prev) => ({ ...prev, status: event.target.value }))
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
                <button
                  type="button"
                  className="issues-btn secondary"
                  onClick={closeIssueModal}
                >
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
          <div className="issues-modal" onClick={(event) => event.stopPropagation()}>
            <div className="issues-modal-title">요약 리포트 생성</div>

            <form onSubmit={submitReport} className="issues-form">
              <select
                className="issues-select"
                value={reportForm.issueId}
                onChange={(event) =>
                  setReportForm((prev) => ({ ...prev, issueId: event.target.value }))
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
                onChange={(event) =>
                  setReportForm((prev) => ({ ...prev, type: event.target.value }))
                }
              >
                <option value="이슈 리포트">이슈 리포트</option>
                <option value="브리핑 노트">브리핑 노트</option>
                <option value="상황 보고서">상황 보고서</option>
              </select>

              {selectedReportIssue && (
                <div className="issues-report-preview">
                  <div className="issues-report-preview-title">
                    {selectedReportIssue.title}
                  </div>
                  <div className="issues-report-preview-summary">
                    {selectedReportIssue.detailSummary || selectedReportIssue.summary}
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
