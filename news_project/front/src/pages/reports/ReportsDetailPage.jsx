import React from "react";
import { useNavigate } from "react-router-dom";

const reports = [
  { id: "REP-001", type: "주간 브리핑", title: "이번 주 핵심 이슈 5분 정리", updatedAt: "오늘", desc: "상위 이슈 요약 + 타임라인 + 주요 키워드" },
  { id: "REP-002", type: "이슈 리포트", title: "정책 발표 이슈 리포트", updatedAt: "어제", desc: "쟁점/반론/근거 기사 링크 포함" },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const open = (id) => navigate(`/?view=report&id=${encodeURIComponent(id)}`);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="pageTitle">요약/리포트</div>
          <div className="pageDesc">이슈를 카드/리포트 형태로 정리</div>
        </div>
      </div>

      <div className="grid3">
        {reports.map((r) => (
          <button key={r.id} className="card reportCard" onClick={() => open(r.id)} type="button">
            <div className="reportTop">
              <span className="badge">{r.type}</span>
              <span className="muted">{r.updatedAt}</span>
            </div>
            <div className="issueTitle">{r.title}</div>
            <div className="issueShort">{r.desc}</div>
            <div className="cardFoot">
              <span className="linkLike">열기</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
