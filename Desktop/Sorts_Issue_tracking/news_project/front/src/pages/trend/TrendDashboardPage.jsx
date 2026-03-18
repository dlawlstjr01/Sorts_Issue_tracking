import React from "react";
import { useNavigate } from "react-router-dom";

const rows = [
  { k: "금리", score: 98, why: "언급량 증가 + 동시출현 확대" },
  { k: "협상", score: 90, why: "국제 이슈 집중" },
  { k: "장애", score: 84, why: "플랫폼 업데이트 영향" },
  { k: "논쟁", score: 77, why: "사회 이슈 확산" },
];

export default function TrendDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="pageTitle">트렌드 키워드 대시보드</div>
          <div className="pageDesc">키워드 점수화/근거 요약 형태</div>
        </div>
        <button className="btn ghost" onClick={() => navigate("/?view=issues")} type="button">
          이슈로 돌아가기
        </button>
      </div>

      <div className="card pad">
        <div className="table">
          <div className="tr th">
            <div>키워드</div>
            <div>점수</div>
            <div>설명</div>
          </div>
          {rows.map((r) => (
            <div key={r.k} className="tr">
              <div className="td strong">{r.k}</div>
              <div className="td">{r.score}</div>
              <div className="td muted">{r.why}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
