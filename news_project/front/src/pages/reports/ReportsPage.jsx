import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import SideMenuCard from "../../components/SideMenuCard";
import ConfirmModal from "../../components/ConfirmModal";

const GENERATED_REPORTS_KEY = "generatedReports";

const reports = [];

export default function ReportsPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const open = (id) => navigate(`/?view=report&id=${encodeURIComponent(id)}`);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");

  const [generatedReports, setGeneratedReports] = useState([]);
  const confirmActionRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });

  useEffect(() => {
    // ✅ 이슈 페이지에서 생성한 AI 리포트 초안을 함께 보여준다.
    try {
      const parsed = JSON.parse(localStorage.getItem(GENERATED_REPORTS_KEY) || "[]");
      setGeneratedReports(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGeneratedReports([]);
    }
  }, []);

  const allReports = useMemo(() => [...generatedReports, ...reports], [generatedReports]);
  const generatedIdSet = useMemo(
    () => new Set(generatedReports.map((item) => item.id)),
    [generatedReports]
  );

  const recentUpdate = useMemo(() => {
    if (allReports.length === 0) return "없음";
    return allReports[0]?.updatedAt || "미정";
  }, [allReports]);

  const coreTopics = useMemo(() => {
    if (allReports.length === 0) return "없음";
    const types = [...new Set(allReports.map((item) => item.type).filter(Boolean))];
    return types.slice(0, 2).join(" · ") || "미정";
  }, [allReports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allReports.filter((r) => {
      const typeMatch = filter === "전체" || r.type === filter;
      const textMatch =
        !q ||
        String(r.title || "").toLowerCase().includes(q) ||
        String(r.desc || "").toLowerCase().includes(q) ||
        String(r.id || "").toLowerCase().includes(q);
      return typeMatch && textMatch;
    });
  }, [allReports, query, filter]);

  const handleDeleteReport = (event, reportId) => {
    event.preventDefault();
    event.stopPropagation();
    confirmActionRef.current = () => {
      const next = generatedReports.filter((item) => item.id !== reportId);
      setGeneratedReports(next);
      try {
        localStorage.setItem(GENERATED_REPORTS_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage exceptions.
      }
    };
    setConfirmModal({ open: true, message: "리포트를 삭제할까요?" });
  };

  const closeConfirmModal = () => {
    confirmActionRef.current = null;
    setConfirmModal({ open: false, message: "" });
  };

  const handleConfirmModal = () => {
    const action = confirmActionRef.current;
    closeConfirmModal();
    if (action) action();
  };

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
            <div className="reports-stat-value">{allReports.length}건</div>
          </div>
          <div className="reports-stat">
            <div className="reports-stat-label">최근 업데이트</div>
            <div className="reports-stat-value">{recentUpdate}</div>
          </div>
          <div className="reports-stat">
            <div className="reports-stat-label">핵심 주제</div>
            <div className="reports-stat-value">{coreTopics}</div>
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
            <motion.button
              key={item}
              type="button"
              className={`reports-chip ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
              // 이슈 추적 필터와 동일한 모션으로 인터랙션을 통일한다.
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

      <div className="reports-grid">
        {filtered.length === 0 ? (
          <div className="reports-empty">검색 결과가 없습니다.</div>
        ) : (
          filtered.map((r) => {
            const isGenerated = generatedIdSet.has(r.id);
            return (
              <div
                key={r.id}
                className="report-card"
                role="button"
                tabIndex={0}
                onClick={() => open(r.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") open(r.id);
                }}
              >
                <div className="report-card-top">
                  <div className="report-card-meta">
                    <span className="badge">{r.type}</span>
                    <span className={`report-status ${r.status === "신규" ? "new" : "update"}`}>
                      {r.status}
                    </span>
                    <span className="report-date">{r.updatedAt}</span>
                  </div>
                  {isGenerated && (
                    <button
                      type="button"
                      className="report-delete"
                      onClick={(event) => handleDeleteReport(event, r.id)}
                      aria-label="리포트 삭제"
                    >
                      삭제
                    </button>
                  )}
                </div>
              <div className="report-title">{r.title}</div>
              <div className="report-desc">{r.desc}</div>
              <div className="report-card-foot">
                <span className="report-id">{r.id}</span>
                <span className="report-link">열기</span>
              </div>
              </div>
            );
          })
        )}
      </div>
        </section>
        <aside className="reports-side">
          <SideMenuCard collapsible showScrollTop />
        </aside>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        message={confirmModal.message}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmModal}
      />
    </div>
  );
}
