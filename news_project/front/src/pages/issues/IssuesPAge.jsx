import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIssues } from "../../api/issuesApi";
import SideMenuCard from "../../components/SideMenuCard";

const FILTERS = ["전체", "정책", "산업", "경제", "규제"];

export default function IssuesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getIssues();
        if (mounted) setIssues(data);
      } catch (err) {
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
        issue.title.toLowerCase().includes(q) ||
        issue.summary.toLowerCase().includes(q) ||
        issue.id.toLowerCase().includes(q);
      return categoryMatch && textMatch;
    });
  }, [query, filter]);

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
            <button
              key={item}
              type="button"
              className={`issues-chip ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
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
          
          <SideMenuCard />
<div className="issue-side-card">
            <div className="issue-side-title">빠른 작업</div>
            <button type="button" className="issue-quick-btn primary">
              신규 이슈 등록
            </button>
            <button type="button" className="issue-quick-btn">
              요약 리포트 생성
            </button>
          </div>

          <div className="issue-side-card">
            <div className="issue-side-title">오늘의 요약</div>
            <div className="issue-side-item">
              <div className="issue-side-label">핵심 키워드</div>
              <div className="issue-side-value">금리 · 정책 · 공급망</div>
            </div>
            <div className="issue-side-item">
              <div className="issue-side-label">감성 추이</div>
              <div className="issue-side-value">혼합</div>
            </div>
            <div className="issue-side-item">
              <div className="issue-side-label">주목 섹터</div>
              <div className="issue-side-value">산업재 · 금융</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
