import React from "react";
import { useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { key: "issues", label: "이슈 추적" },
  { key: "reports", label: "요약/리포트" },
  { key: "archive", label: "아카이브" },
  { key: "support", label: "고객센터" }
];

export default function SideMenuCard() {
  const navigate = useNavigate();

  return (
    <div className="side-menu-card">
      <div className="side-menu-title">카테고리</div>
      <div className="side-menu-list">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="side-menu-btn"
            onClick={() => navigate(`/?view=${encodeURIComponent(item.key)}`)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
