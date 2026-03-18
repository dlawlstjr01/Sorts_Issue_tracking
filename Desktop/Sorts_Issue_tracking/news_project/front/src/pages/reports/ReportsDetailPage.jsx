import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";
import ConfirmModal from "../../components/ConfirmModal";

const GENERATED_REPORTS_KEY = "generatedReports";

const reports = [];

function normalizeReportShape(raw) {
  return {
    ...raw,
    summary: raw?.summary || raw?.desc || "요약 정보가 없습니다.",
    highlights: Array.isArray(raw?.highlights) ? raw.highlights : [],
    timeline: Array.isArray(raw?.timeline) ? raw.timeline : [],
    related: Array.isArray(raw?.related) ? raw.related : [],
    metrics: raw?.metrics || { coverage: "-", volatility: "-", sentiment: "-" },
  };
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("id");
  }, [location.search]);

  const generatedReports = useMemo(() => {
    //  이슈 페이지에서 생성된 리포트도 상세 페이지에서 조회할 수 있게 한다.
    try {
      const parsed = JSON.parse(localStorage.getItem(GENERATED_REPORTS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const report = useMemo(() => {
    const fromGenerated = generatedReports.find((item) => item.id === reportId);
    const fromSeed = reports.find((item) => item.id === reportId);
    const found = fromGenerated || fromSeed || null;
    return found ? normalizeReportShape(found) : null;
  }, [generatedReports, reportId]);

  const isGenerated = useMemo(
    () => generatedReports.some((item) => item.id === reportId),
    [generatedReports, reportId]
  );

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    if (!reportId) return;
    try {
      const parsed = JSON.parse(localStorage.getItem(GENERATED_REPORTS_KEY) || "[]");
      const next = Array.isArray(parsed) ? parsed.filter((item) => item.id !== reportId) : [];
      localStorage.setItem(GENERATED_REPORTS_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage exceptions.
    }
    navigate("/?view=reports");
  };

  return (
    <div className="page report-detail-page">
      <div className="report-detail-top">
        <button type="button" className="report-back" onClick={() => navigate("/?view=reports")}>
          ← 목록으로
        </button>
        {isGenerated && (
          <button type="button" className="report-delete" onClick={() => setConfirmOpen(true)}>
            삭제
          </button>
        )}
      </div>

      {!report ? (
        <div className="report-detail-empty">
          <div className="report-detail-title">리포트를 찾을 수 없습니다.</div>
          <div className="report-detail-desc">요청하신 리포트가 삭제되었거나 주소가 잘못되었습니다.</div>
          <button type="button" className="report-back primary" onClick={() => navigate("/?view=reports")}>
            리포트 목록으로
          </button>
        </div>
      ) : (
        <>
          <div className="report-detail-hero">
            <div className="report-detail-meta">
              <span className="badge">{report.type}</span>
              <span className={`report-status ${report.status === "신규" ? "new" : "update"}`}>
                {report.status}
              </span>
              <span className="report-date">{report.updatedAt}</span>
            </div>
            <div className="report-detail-title">{report.title}</div>
            <div className="report-detail-desc">{report.desc}</div>
          </div>

          <div className="report-detail-grid">
            <div className="report-detail-main">
              <section className="report-section">
                <div className="report-section-title">요약</div>
                <p className="report-section-body">{report.summary}</p>
              </section>

              <section className="report-section">
                <div className="report-section-title">핵심 포인트</div>
                <ul className="report-bullets">
                  {report.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="report-section">
                <div className="report-section-title">타임라인</div>
                <div className="report-timeline">
                  {report.timeline.map((item) => (
                    <div key={`${item.time}-${item.event}`} className="report-timeline-item">
                      <div className="report-timeline-time">{item.time}</div>
                      <div className="report-timeline-event">{item.event}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="report-detail-side">
              
              <SideMenuCard collapsible showScrollTop />
<div className="report-side-card">
                <div className="report-side-title">메타 정보</div>
                <div className="report-side-row">
                  <span>리포트 ID</span>
                  <span>{report.id}</span>
                </div>
                <div className="report-side-row">
                  <span>커버리지</span>
                  <span>{report.metrics.coverage}</span>
                </div>
                <div className="report-side-row">
                  <span>변동성</span>
                  <span>{report.metrics.volatility}</span>
                </div>
                <div className="report-side-row">
                  <span>감성</span>
                  <span>{report.metrics.sentiment}</span>
                </div>
              </div>

              <div className="report-side-card">
                <div className="report-side-title">관련 콘텐츠</div>
                <div className="report-related">
                  {report.related.map((item) => (
                    <div key={`${item.title}-${item.source}`} className="report-related-item">
                      <div className="report-related-title">{item.title}</div>
                      <div className="report-related-source">{item.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmOpen}
        message="리포트를 삭제할까요?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          handleDelete();
        }}
      />
    </div>
  );
}
