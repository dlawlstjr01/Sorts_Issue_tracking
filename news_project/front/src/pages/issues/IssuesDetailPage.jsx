import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { getIssues, getIssueArticleById } from "../../api/newsApi";
import SideMenuCard from "../../components/SideMenuCard";

const FILTERS = ["전체", "정책", "산업", "경제", "규제"];
const CATEGORY_OPTIONS = FILTERS.filter((item) => item !== "전체");
const STATUS_OPTIONS = ["모니터링", "분석중", "요약완료"];

// ✅ 사용자 입력 이슈와 AI 생성 리포트를 브라우저에 저장하는 키
const CUSTOM_ISSUES_KEY = "customIssues";
const GENERATED_REPORTS_KEY = "generatedReports";

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

function buildIssueDetail(summary, category) {
  return {
    why: `${category} 관련 이슈가 새롭게 등록되어 배경 맥락을 수집 중입니다.`,
    now: summary,
    next: "후속 데이터와 기사 근거를 연결해 상세 분석을 보강할 예정입니다.",
    summary,
    highlights: ["초기 이슈 등록", "담당자 검토 필요", "근거 기사 연결 예정"],
    timeline: [{ time: "지금", event: "사용자 이슈 등록", source: "수동 입력" }],
    evidence: [{ sum: "등록된 요약 기반", ev: summary, source: "사용자 입력" }],
    keywords: [category, "신규 이슈"],
  };
}

// ✅ 이슈 데이터를 기반으로 리포트 본문을 자동 생성한다.
function buildGeneratedReport(issue, type) {
  const generatedAt = Date.now();
  const reportId = `REP-${String(generatedAt).slice(-6)}`;

  const highlights = [
    `이슈 ${issue.id} 핵심: ${issue.title}`,
    `현재 상태: ${issue.status}, 우선순위: ${issue.priority}`,
    `카테고리 ${issue.category} 기준 후속 모니터링 필요`,
  ];

  const timeline = [
    { time: issue.updatedAt || "최근", event: "이슈 신호 감지 및 등록" },
    { time: "현재", event: "핵심 요약 및 리포트 초안 자동 생성" },
    { time: "다음", event: "근거 기사 및 지표 추가 분석 예정" },
  ];

  const related = [
    { title: issue.title, source: "이슈 추적" },
    { title: `${issue.category} 배경 기사 수집`, source: "자동 추천" },
  ];

  return {
    id: reportId,
    type,
    title: `${issue.title} ${type}`,
    updatedAt: "오늘",
    desc: issue.summary,
    status: "신규",
    summary: `${issue.summary} AI 초안 기준으로 핵심 포인트를 구조화했으며, 팀 검토 후 최종본으로 확정하는 흐름을 권장합니다.`,
    highlights,
    timeline,
    related,
    metrics: {
      coverage: "초안",
      volatility: issue.severity || "보통",
      sentiment: issue.status === "요약완료" ? "중립" : "혼합",
    },
    sourceIssueId: issue.id,
    createdAt: generatedAt,
  };
}

export default function IssuesPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ 빠른 작업 피드백 토스트: 작업 완료 결과를 짧게 보여준다.
  const [quickToast, setQuickToast] = useState("");

  // ✅ 신규 이슈 등록 모달 상태/폼
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: "",
    summary: "",
    category: CATEGORY_OPTIONS[0],
    status: STATUS_OPTIONS[0],
  });
  const [issueFormError, setIssueFormError] = useState("");

  // ✅ 요약 리포트 생성 모달 상태/폼
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    issueId: "",
    type: "이슈 리포트",
  });
  const [reportFormError, setReportFormError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const seed = await getIssues();
        const custom = readLocalArray(CUSTOM_ISSUES_KEY);
        // ✅ 더미 이슈 + 사용자 등록 이슈를 함께 보여준다.
        if (mounted) setIssues([...custom, ...seed]);
      } catch {
        if (mounted) setError("이슈 데이터를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIssues();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((issue) => {
      const categoryMatch = filter === "전체" || issue.category === filter;
      const textMatch =
        !q ||
        String(issue.title || "").toLowerCase().includes(q) ||
        String(issue.summary || "").toLowerCase().includes(q) ||
        String(issue.id || "").toLowerCase().includes(q);
      return categoryMatch && textMatch;
    });
  }, [issues, query, filter]);

  const selectedReportIssue = useMemo(
    () => issues.find((item) => item.id === reportForm.issueId) || null,
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
    return {
      keywords: categories.slice(0, 3).join(" · ") || "데이터 없음",
      sentiment: "데이터 없음",
      sectors: "데이터 없음",
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
      issueId: issues[0].id,
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
      title,
      summary,
      category: issueForm.category,
      status: issueForm.status,
      updatedAt: "오늘",
      priority: priorityByCategory(issueForm.category),
      severity: severityByStatus(issueForm.status),
      detail: buildIssueDetail(summary, issueForm.category),
    };

    setIssues((prev) => [newIssue, ...prev]);

    const savedCustom = readLocalArray(CUSTOM_ISSUES_KEY);
    writeLocalArray(CUSTOM_ISSUES_KEY, [newIssue, ...savedCustom]);

    setFilter("전체");
    setQuery("");
    closeIssueModal();
    setQuickToast(`${newIssue.id} 이슈가 등록되었습니다.`);
  };

  const submitReport = (event) => {
    event.preventDefault();

    if (!reportForm.issueId) {
      setReportFormError("리포트로 만들 이슈를 선택해 주세요.");
      return;
    }

    const issue = issues.find((item) => item.id === reportForm.issueId);
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

  // ✅ ESC 키로 모달을 닫아 키보드 접근성을 맞춘다.
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

  // ✅ 토스트는 잠깐 보여주고 자동으로 닫는다.
  useEffect(() => {
    if (!quickToast) return undefined;
    const timer = window.setTimeout(() => setQuickToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [quickToast]);

  return (
    <div className="page issues-page">
      <div className="issues-hero">
        <div>
          <div className="pageTitle">이슈 추적</div>
          <div className="pageDesc">핵심 이슈를 빠르게 추적하고 우선순위를 정리합니다.</div>
        </div>
        <div className="issues-stats">
          <div className="issues-stat">
            <div className="issues-stat-label">활성 이슈</div>
            <div className="issues-stat-value">{issues.length}건</div>
          </div>
          <div className="issues-stat">
            <div className="issues-stat-label">분석중</div>
            <div className="issues-stat-value">
              {issues.filter((item) => item.status === "분석중").length}건
            </div>
          </div>
          <div className="issues-stat">
            <div className="issues-stat-label">오늘 업데이트</div>
            <div className="issues-stat-value">
              {issues.filter((item) => item.updatedAt === "오늘").length}건
            </div>
          </div>
        </div>
      </div>

      <div className="issues-toolbar">
        <div className="issues-search">
          <input
            className="issues-input"
            type="text"
            placeholder="이슈 제목, 요약, ID로 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="issues-filters">
          {FILTERS.map((item) => (
            <motion.button
              key={item}
              type="button"
              className={`issues-chip ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
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
              {item}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="issues-grid">
        <section className="issues-list">
          {loading ? (
            <div className="issues-empty">불러오는 중...</div>
          ) : error ? (
            <div className="issues-empty">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="issues-empty">검색 결과가 없습니다.</div>
          ) : (
            filtered.map((issue) => (
              <div key={issue.id} className="issue-card">
                <div className="issue-card-top">
                  <div className="issue-badges">
                    <span className="issue-id">{issue.id}</span>
                    <span
                      className={`issue-pill issue-status ${
                        issue.status === "요약완료" ? "done" : issue.status === "분석중" ? "analysis" : "monitor"
                      }`}
                    >
                      {issue.status}
                    </span>
                    <span
                      className={`issue-pill issue-priority ${
                        issue.priority === "높음" ? "high" : issue.priority === "중간" ? "mid" : "low"
                      }`}
                    >
                      우선순위 {issue.priority}
                    </span>
                    <span
                      className={`issue-pill issue-severity ${
                        issue.severity === "위험" ? "danger" : issue.severity === "경고" ? "warn" : "normal"
                      }`}
                    >
                      심각도 {issue.severity}
                    </span>
                  </div>
                  <span className="issue-date">{issue.updatedAt}</span>
                </div>
                <div className="issue-title">{issue.title}</div>
                <div className="issue-summary">{issue.summary}</div>
                <div className="issue-card-foot">
                  <span className="issue-category">{issue.category}</span>
                  <button
                    type="button"
                    className="issue-action"
                    onClick={() => navigate(`/?view=issue&id=${encodeURIComponent(issue.id)}`)}
                  >
                    상세 보기
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="issues-side">
          <SideMenuCard collapsible showScrollTop />
          <div className="issue-side-card">
            <div className="issue-side-title">빠른 작업</div>
            <button type="button" className="issue-quick-btn primary" onClick={openIssueModal}>
              <span className="issue-quick-btn-top">
                <span className="issue-quick-btn-label">신규 이슈 등록</span>
                <span className="issue-quick-btn-state">입력형</span>
              </span>
              <span className="issue-quick-btn-desc">사용자가 제목/요약/카테고리를 직접 등록합니다.</span>
            </button>
        
          </div>

          <div className="issue-side-card">
            <div className="issue-side-title">오늘의 요약</div>
            <div className="issue-side-item">
              <div className="issue-side-label">핵심 키워드</div>
              <div className="issue-side-value">{summarySnapshot.keywords}</div>
            </div>
            <div className="issue-side-item">
              <div className="issue-side-label">감성 추리</div>
              <div className="issue-side-value">{summarySnapshot.sentiment}</div>
            </div>
            <div className="issue-side-item">
              <div className="issue-side-label">주목 섹터</div>
              <div className="issue-side-value">{summarySnapshot.sectors}</div>
            </div>
          </div>
        </aside>
      </div>

      {issueModalOpen && (
        <div className="issue-quick-modal-backdrop" role="presentation" onClick={closeIssueModal}>
          <section
            className="issue-quick-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-create-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="issue-create-modal-title" className="issue-quick-modal-title">
              신규 이슈 등록
            </h3>
            <p className="issue-quick-modal-message">핵심 항목을 입력하면 목록에 즉시 반영됩니다.</p>

            <form className="issue-quick-form" onSubmit={submitIssue}>
              <label className="issue-quick-field" htmlFor="issue-title">
                <span className="issue-quick-label">이슈 제목</span>
                <input
                  id="issue-title"
                  className="issue-quick-input"
                  value={issueForm.title}
                  onChange={(event) => setIssueForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="예: 공급망 병목 심화"
                />
              </label>

              <label className="issue-quick-field" htmlFor="issue-summary">
                <span className="issue-quick-label">요약</span>
                <textarea
                  id="issue-summary"
                  className="issue-quick-textarea"
                  value={issueForm.summary}
                  onChange={(event) => setIssueForm((prev) => ({ ...prev, summary: event.target.value }))}
                  placeholder="핵심 배경과 현재 상황을 1~2문장으로 입력"
                  rows={3}
                />
              </label>

              <div className="issue-quick-grid">
                <label className="issue-quick-field" htmlFor="issue-category">
                  <span className="issue-quick-label">카테고리</span>
                  <select
                    id="issue-category"
                    className="issue-quick-select"
                    value={issueForm.category}
                    onChange={(event) => setIssueForm((prev) => ({ ...prev, category: event.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="issue-quick-field" htmlFor="issue-status">
                  <span className="issue-quick-label">상태</span>
                  <select
                    id="issue-status"
                    className="issue-quick-select"
                    value={issueForm.status}
                    onChange={(event) => setIssueForm((prev) => ({ ...prev, status: event.target.value }))}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {issueFormError && <div className="issue-quick-error">{issueFormError}</div>}

              <div className="issue-quick-modal-actions">
                <button type="button" className="issue-quick-modal-cancel" onClick={closeIssueModal}>
                  취소
                </button>
                <button type="submit" className="issue-quick-modal-confirm">
                  등록
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {reportModalOpen && (
        <div className="issue-quick-modal-backdrop" role="presentation" onClick={closeReportModal}>
          <section
            className="issue-quick-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-report-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="issue-report-modal-title" className="issue-quick-modal-title">
              요약 리포트 생성
            </h3>
            <p className="issue-quick-modal-message">이슈를 선택하면 AI 초안 리포트를 자동 생성합니다.</p>

            <form className="issue-quick-form" onSubmit={submitReport}>
              <label className="issue-quick-field" htmlFor="report-issue">
                <span className="issue-quick-label">대상 이슈</span>
                <select
                  id="report-issue"
                  className="issue-quick-select"
                  value={reportForm.issueId}
                  onChange={(event) => setReportForm((prev) => ({ ...prev, issueId: event.target.value }))}
                >
                  {issues.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} · {item.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="issue-quick-field" htmlFor="report-type">
                <span className="issue-quick-label">리포트 유형</span>
                <select
                  id="report-type"
                  className="issue-quick-select"
                  value={reportForm.type}
                  onChange={(event) => setReportForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="이슈 리포트">이슈 리포트</option>
                  <option value="주간 브리핑">주간 브리핑</option>
                </select>
              </label>

              {selectedReportIssue && (
                <div className="issue-quick-helper">
                  선택 이슈: {selectedReportIssue.id} / 우선순위 {selectedReportIssue.priority} / 심각도{" "}
                  {selectedReportIssue.severity}
                </div>
              )}

              {reportFormError && <div className="issue-quick-error">{reportFormError}</div>}

              <div className="issue-quick-modal-actions">
                <button type="button" className="issue-quick-modal-cancel" onClick={closeReportModal}>
                  취소
                </button>
                <button type="submit" className="issue-quick-modal-confirm">
                  생성
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {quickToast && <div className="issue-quick-toast">{quickToast}</div>}
    </div>
  );
}
