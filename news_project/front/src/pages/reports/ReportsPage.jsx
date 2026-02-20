import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

const reports = [
  {
    id: "REP-001",
    type: "주간 브리핑",
    title: "이번 주 핵심 이슈 5분 정리",
    updatedAt: "오늘",
    desc: "상위 이슈 요약 + 타임라인 + 주요 키워드",
    status: "신규",
  },
  {
    id: "REP-002",
    type: "이슈 리포트",
    title: "정책 발표 이슈 리포트",
    updatedAt: "어제",
    desc: "쟁점/반론/근거 기사 링크 포함",
    status: "업데이트",
  },
  {
    id: "REP-003",
    type: "주간 브리핑",
    title: "산업 트렌드 요약 브리핑",
    updatedAt: "2일 전",
    desc: "주요 지표 변화 + 리스크 요인 정리",
    status: "업데이트",
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const open = (id) => navigate(`/?view=report&id=${encodeURIComponent(id)}`);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const typeMatch = filter === "전체" || r.type === filter;
      const textMatch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      return typeMatch && textMatch;
    });
  }, [query, filter]);

  return (
    <div className="page reports-page">
      <div className="reports-layout">
        <section className="reports-main">
      <div className="reports-hero">
        <div>
          <div className="pageTitle">요약/리포트</div>
          <div className="pageDesc">이슈를 카드/리포트 형태로 정리</div>
        </div>
        <div className="reports-summary">
          <div className="reports-stat">
            <div className="reports-stat-label">등록된 리포트</div>
            <div className="reports-stat-value">{reports.length}건</div>
          </div>
          <div className="reports-stat">
            <div className="reports-stat-label">최근 업데이트</div>
            <div className="reports-stat-value">오늘</div>
          </div>
          <div className="reports-stat">
            <div className="reports-stat-label">핵심 주제</div>
            <div className="reports-stat-value">정책 · 경제</div>
          </div>
        </div>
      </div>

      <div className="reports-toolbar">
        <div className="reports-search">
          <input
            className="reports-input"
            type="text"
            placeholder="리포트 제목 또는 키워드를 검색하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="reports-filters">
          {["전체", "주간 브리핑", "이슈 리포트"].map((item) => (
            <button
              key={item}
              type="button"
              className={`reports-chip ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="reports-grid">
        {filtered.length === 0 ? (
          <div className="reports-empty">검색 결과가 없습니다.</div>
        ) : (
          filtered.map((r) => (
            <button key={r.id} className="report-card" onClick={() => open(r.id)} type="button">
              <div className="report-card-top">
                <span className="badge">{r.type}</span>
                <span className={`report-status ${r.status === "신규" ? "new" : "update"}`}>
                  {r.status}
                </span>
                <span className="report-date">{r.updatedAt}</span>
              </div>
              <div className="report-title">{r.title}</div>
              <div className="report-desc">{r.desc}</div>
              <div className="report-card-foot">
                <span className="report-id">{r.id}</span>
                <span className="report-link">열기</span>
              </div>
            </button>
          ))
        )}
      </div>
        </section>
        <aside className="reports-side">
          <SideMenuCard />
        </aside>
      </div>
    </div>
  );
}
