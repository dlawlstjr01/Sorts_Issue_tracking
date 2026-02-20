import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

const reports = [
  {
    id: "REP-001",
    type: "주간 브리핑",
    title: "이번 주 핵심 이슈 5분 정리",
    updatedAt: "오늘",
    desc: "상위 이슈 요약 + 타임라인 + 주요 키워드",
    status: "신규",
    summary:
      "이번 주는 정책 이슈와 경제 지표가 핵심으로, 단기 변동성과 중장기 리스크가 함께 부각되었습니다.",
    highlights: ["정책 발표 이후 시장 반응 급변", "주요 키워드: 금리, 공급망, 투자심리", "핵심 이해관계자 발언 집중"],
    timeline: [
      { time: "월", event: "정책 초안 공개 및 시장 반응" },
      { time: "수", event: "관련 기업 브리핑 및 추가 질의" },
      { time: "금", event: "후속 해설 및 영향 분석 확산" },
    ],
    related: [
      { title: "정책 발표 핵심 요약", source: "종합 뉴스" },
      { title: "업계 영향 분석 리포트", source: "시장 리서치" },
    ],
    metrics: { coverage: "82%", volatility: "중간", sentiment: "혼합" },
  },
  {
    id: "REP-002",
    type: "이슈 리포트",
    title: "정책 발표 이슈 리포트",
    updatedAt: "어제",
    desc: "쟁점/반론/근거 기사 링크 포함",
    status: "업데이트",
    summary:
      "정책 발표 후 쟁점과 반론이 동시에 확산되며, 주요 매체는 근거 자료를 중심으로 분석을 강화했습니다.",
    highlights: ["찬성 근거: 투자 확장 기대", "반론: 시행 속도와 비용 문제", "해외 사례 비교 증가"],
    timeline: [
      { time: "D-2", event: "사전 보도 및 루머 확산" },
      { time: "D-1", event: "공식 발표와 정책 전문 공개" },
      { time: "D", event: "후속 브리핑 및 시장 반응" },
    ],
    related: [
      { title: "쟁점/반론 정리 기사", source: "정책 브리핑" },
      { title: "전문가 코멘트 모음", source: "리서치 노트" },
    ],
    metrics: { coverage: "74%", volatility: "높음", sentiment: "부정 우세" },
  },
  {
    id: "REP-003",
    type: "주간 브리핑",
    title: "산업 트렌드 요약 브리핑",
    updatedAt: "2일 전",
    desc: "주요 지표 변화 + 리스크 요인 정리",
    status: "업데이트",
    summary:
      "산업 트렌드는 안정적인 성장 흐름이지만 일부 구간에서 공급 불확실성이 증가하고 있습니다.",
    highlights: ["공급 리스크 지속", "투자 확장세 둔화", "규제 논의 본격화"],
    timeline: [
      { time: "월", event: "핵심 지표 발표" },
      { time: "목", event: "업계 컨퍼런스 발표" },
      { time: "금", event: "관련 정책 논의 재점화" },
    ],
    related: [
      { title: "산업 지표 요약 리포트", source: "데이터 분석" },
      { title: "규제 변화 전망", source: "정책 리서치" },
    ],
    metrics: { coverage: "68%", volatility: "낮음", sentiment: "긍정" },
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("id");
  }, [location.search]);

  const report = useMemo(() => reports.find((item) => item.id === reportId) || null, [reportId]);

  return (
    <div className="page report-detail-page">
      <div className="report-detail-top">
        <button type="button" className="report-back" onClick={() => navigate("/?view=reports")}>
          ← 목록으로
        </button>
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
              
              <SideMenuCard />
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
    </div>
  );
}
