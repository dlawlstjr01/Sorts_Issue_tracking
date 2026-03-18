import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";
import { getIssues } from "../../api/issuesApi";

const CUSTOM_ISSUES_KEY = "customIssues";
const GENERATED_REPORTS_KEY = "generatedReports";

function readLocalArray(key) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeIssues(seedIssues, customIssues) {
  const merged = [...customIssues, ...seedIssues];
  const dedupe = new Map();
  merged.forEach((item, index) => {
    const key = String(item?.id || `${item?.title || ""}_${index}`).trim();
    if (!key || dedupe.has(key)) return;
    dedupe.set(key, item);
  });
  return Array.from(dedupe.values());
}

function formatReportType(type) {
  const text = String(type || "").trim();
  return text || "리포트";
}

function formatIssueCategory(category) {
  const text = String(category || "").trim();
  return text || "카테고리 미지정";
}

export default function IssueReportPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [seedIssues, customIssues] = await Promise.all([
          getIssues(),
          Promise.resolve(readLocalArray(CUSTOM_ISSUES_KEY)),
        ]);
        if (!mounted) return;
        setIssues(mergeIssues(seedIssues, customIssues));
      } catch {
        if (!mounted) return;
        setError("이슈 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const syncReports = () => {
      setReports(readLocalArray(GENERATED_REPORTS_KEY));
    };

    syncReports();
    const onStorage = (event) => {
      if (!event || event.key === GENERATED_REPORTS_KEY) {
        syncReports();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const issueCount = issues.length;
  const reportCount = reports.length;

  const activeIssueCount = useMemo(() => {
    return issues.filter((item) => !String(item?.status || "").includes("완료")).length;
  }, [issues]);

  const categorySummary = useMemo(() => {
    const categories = [...new Set(issues.map((item) => String(item?.category || "").trim()).filter(Boolean))];
    if (categories.length === 0) return "카테고리 데이터 없음";
    return categories.slice(0, 3).join(" · ");
  }, [issues]);

  const recentIssues = useMemo(() => issues.slice(0, 5), [issues]);
  const recentReports = useMemo(() => reports.slice(0, 5), [reports]);

  return (
    <div className="page issue-report-page">
      <section className="issue-report-hero">
        <div className="issue-report-hero-copy">
          <p className="issue-report-kicker">Unified Workspace</p>
          <h1 className="issue-report-title">이슈 추적/리포트</h1>
          <p className="issue-report-desc">
            이슈 모니터링과 요약 리포트 생성을 한 화면에서 관리하고, 필요할 때 각 작업실로 바로 이동할 수 있습니다.
          </p>
        </div>
        <div className="issue-report-stat-grid">
          <article className="issue-report-stat-card">
            <span className="issue-report-stat-label">전체 이슈</span>
            <strong className="issue-report-stat-value">{issueCount}건</strong>
          </article>
          <article className="issue-report-stat-card">
            <span className="issue-report-stat-label">진행 중 이슈</span>
            <strong className="issue-report-stat-value">{activeIssueCount}건</strong>
          </article>
          <article className="issue-report-stat-card">
            <span className="issue-report-stat-label">생성 리포트</span>
            <strong className="issue-report-stat-value">{reportCount}건</strong>
          </article>
        </div>
      </section>

      <div className="issue-report-layout">
        <section className="issue-report-main">
          <div className="issue-report-action-grid">
            <article className="issue-report-action-card">
              <h2 className="issue-report-action-title">이슈 추적 작업실</h2>
              <p className="issue-report-action-desc">
                이슈 등록, 상태 관리, 우선순위 확인과 상세 분석까지 추적 흐름을 관리합니다.
              </p>
              <button type="button" className="issue-report-action-btn" onClick={() => navigate("/?view=issues")}>
                이슈 추적 열기
              </button>
            </article>

            <article className="issue-report-action-card is-report">
              <h2 className="issue-report-action-title">요약/리포트 작업실</h2>
              <p className="issue-report-action-desc">
                생성된 리포트를 확인하고 상세 분석 페이지에서 핵심 요약과 타임라인을 검토합니다.
              </p>
              <button type="button" className="issue-report-action-btn" onClick={() => navigate("/?view=reports")}>
                요약/리포트 열기
              </button>
            </article>
          </div>

          <div className="issue-report-list-grid">
            <article className="issue-report-list-card">
              <div className="issue-report-list-head">
                <h3>최근 이슈</h3>
                <button type="button" onClick={() => navigate("/?view=issues")}>
                  전체 보기
                </button>
              </div>

              {loading ? (
                <p className="issue-report-empty">이슈 데이터를 불러오는 중입니다.</p>
              ) : error ? (
                <p className="issue-report-empty">{error}</p>
              ) : recentIssues.length === 0 ? (
                <p className="issue-report-empty">표시할 이슈가 없습니다.</p>
              ) : (
                <div className="issue-report-list">
                  {recentIssues.map((item) => (
                    <button
                      type="button"
                      key={String(item?.id || item?.title)}
                      className="issue-report-row"
                      onClick={() => navigate(`/?view=issue&id=${encodeURIComponent(String(item?.id || ""))}`)}
                    >
                      <span className="issue-report-row-title">{item?.title || "제목 없음"}</span>
                      <span className="issue-report-row-meta">{formatIssueCategory(item?.category)}</span>
                    </button>
                  ))}
                </div>
              )}
            </article>

            <article className="issue-report-list-card">
              <div className="issue-report-list-head">
                <h3>최근 리포트</h3>
                <button type="button" onClick={() => navigate("/?view=reports")}>
                  전체 보기
                </button>
              </div>

              {recentReports.length === 0 ? (
                <p className="issue-report-empty">생성된 리포트가 없습니다.</p>
              ) : (
                <div className="issue-report-list">
                  {recentReports.map((item) => (
                    <button
                      type="button"
                      key={String(item?.id || item?.title)}
                      className="issue-report-row"
                      onClick={() => navigate(`/?view=report&id=${encodeURIComponent(String(item?.id || ""))}`)}
                    >
                      <span className="issue-report-row-title">{item?.title || "리포트 제목 없음"}</span>
                      <span className="issue-report-row-meta">{formatReportType(item?.type)}</span>
                    </button>
                  ))}
                </div>
              )}
            </article>
          </div>
        </section>

        <aside className="issue-report-side">
          <SideMenuCard collapsible showScrollTop />
          <div className="issue-report-side-card">
            <h3>오늘의 포인트</h3>
            <p>주요 카테고리: {categorySummary}</p>
            <p>이슈와 리포트를 연결해 흐름을 한 번에 확인해 보세요.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
