import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getIssueById } from "../../api/issuesApi";
import SideMenuCard from "../../components/SideMenuCard";

export default function IssueDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const id = params.get("id");
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchIssue = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getIssueById(id);
        if (mounted) setIssue(data);
      } catch (err) {
        if (mounted) setError("이슈 상세 데이터를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchIssue();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="page issue-detail-page">
      <div className="issue-detail-top">
        <button className="issue-back" onClick={() => navigate("/?view=issues")} type="button">
          ← 목록으로
        </button>
      </div>

      {loading ? (
        <div className="issues-empty">불러오는 중...</div>
      ) : error ? (
        <div className="issues-empty">{error}</div>
      ) : !issue ? (
        <div className="issue-detail-empty">
          <div className="issue-detail-title">이슈를 찾을 수 없습니다.</div>
          <div className="issue-detail-desc">요청하신 이슈가 삭제되었거나 주소가 잘못되었습니다.</div>
          <button className="issue-back primary" onClick={() => navigate("/?view=issues")} type="button">
            이슈 목록으로
          </button>
        </div>
      ) : (
        <>
          <div className="issue-detail-hero">
            <div className="issue-detail-meta">
              <span className="badge">{issue.category}</span>
              <span className={`issue-priority ${issue.priority === "높음" ? "high" : issue.priority === "중간" ? "mid" : "low"}`}>
                우선순위 {issue.priority}
              </span>
              <span className={`issue-severity ${issue.severity === "위험" ? "danger" : issue.severity === "경고" ? "warn" : "normal"}`}>
                심각도 {issue.severity}
              </span>
              <span className="issue-date">업데이트 {issue.updatedAt}</span>
            </div>
            <div className="issue-detail-title">{issue.title}</div>
            <div className="issue-detail-desc">{issue.summary}</div>
          </div>

          <div className="issue-detail-grid">
            <section className="issue-section">
              <div className="issue-section-title">요약</div>
              <p className="issue-section-body">{issue.detail.summary}</p>
            </section>

            <section className="issue-section">
              <div className="issue-section-title">핵심 포인트</div>
              <ul className="issue-bullets">
                {issue.detail.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="issue-section">
              <div className="issue-section-title">타임라인</div>
              <div className="issue-timeline">
                {issue.detail.timeline.map((item) => (
                  <div key={`${item.time}-${item.event}`} className="issue-timeline-item">
                    <div className="issue-timeline-time">{item.time}</div>
                    <div className="issue-timeline-event">{item.event}</div>
                    <div className="issue-timeline-source">{item.source}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="issue-section">
              <div className="issue-section-title">왜 발생했는가</div>
              <p className="issue-section-body">{issue.detail.why}</p>
            </section>

            <section className="issue-section">
              <div className="issue-section-title">지금 상황은</div>
              <p className="issue-section-body">{issue.detail.now}</p>
            </section>

            <section className="issue-section">
              <div className="issue-section-title">앞으로 주목할 포인트</div>
              <p className="issue-section-body">{issue.detail.next}</p>
            </section>

            <section className="issue-section">
              <div className="issue-section-title">근거</div>
              <div className="issue-evidence">
                {issue.detail.evidence.map((item) => (
                  <div key={`${item.sum}-${item.source}`} className="issue-evidence-card">
                    <div className="issue-evidence-label">요약 문장</div>
                    <div className="issue-evidence-text">{item.sum}</div>
                    <div className="issue-evidence-label">근거 문장</div>
                    <div className="issue-evidence-text">{item.ev}</div>
                    <div className="issue-evidence-source">{item.source}</div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="issue-detail-side">
              
              <SideMenuCard />
<div className="issue-side-card">
                <div className="issue-side-title">키워드</div>
                <div className="issue-keywords">
                  {issue.detail.keywords.map((word) => (
                    <span key={word} className="issue-keyword">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
