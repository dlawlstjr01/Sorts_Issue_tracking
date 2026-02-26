import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function IconHome(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
      <path
        d="M12 3.2 3.6 10h1.9v9h5.5v-5.2h2V19h5.5v-9h1.9L12 3.2Zm0 1.8 6.2 5H17v7h-2.5v-5.2H9.5V17H7v-7H5.8L12 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconIssues(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
      <path
        d="M12 2 3 6.5V17.5L12 22l9-4.5V6.5L12 2Zm0 2.3 6.8 3.4L12 11.1 5.2 7.7 12 4.3ZM5 9.2l6 3v7.5l-6-3V9.2Zm14 0v7.5l-6 3v-7.5l6-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconReports(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
      <path d="M4 20V4h2v14h14v2H4Zm4-4V9h2v7H8Zm4 0V6h2v10h-2Zm4 0v-5h2v5h-2Z" fill="currentColor" />
    </svg>
  );
}

function IconArchive(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
      <path d="M4 4h16v4H4V4Zm1 6h14v10H5V10Zm4 2v2h6v-2H9Zm-3-6v2h12V6H6Z" fill="currentColor" />
    </svg>
  );
}

function IconSupport(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
      <path
        d="M12 2a8 8 0 0 0-8 8v3a3 3 0 0 0 3 3h1v-6H7a1 1 0 0 0-1 1v2H5v-3a7 7 0 1 1 14 0v3h-1v-2a1 1 0 0 0-1-1h-1v7a3 3 0 0 1-3 3h-3v-2h3a1 1 0 0 0 1-1v-1h-1a3 3 0 0 0-3 3v1h-2v-1a5 5 0 0 1 5-5h1v-4a8 8 0 0 0-8-8Z"
        fill="currentColor"
      />
    </svg>
  );
}

const MENU_ITEMS = [
  { key: "article-list", label: "\uAE30\uC0AC \uBAA9\uB85D", icon: <IconHome /> },
  { key: "issues", label: "\uC774\uC288 \uCD94\uC801", icon: <IconIssues /> },
  { key: "reports", label: "\uC694\uC57D/\uB9AC\uD3EC\uD2B8", icon: <IconReports /> },
  { key: "archive", label: "\uC544\uCE74\uC774\uBE0C", icon: <IconArchive /> },
  { key: "support", label: "\uACE0\uAC1D\uC13C\uD130", icon: <IconSupport /> },
];

export default function SideMenuCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const view = new URLSearchParams(location.search).get("view") || "main";

  const isItemActive = (key) => {
    if (view === key || view.startsWith(`${key}-`)) return true;
    if (key === "article-list" && view === "main") return true;
    if (key === "issues" && view === "issue") return true;
    if (key === "reports" && view === "report") return true;
    return false;
  };

  return (
    <div className="side-menu-card">
      <div className="side-menu-title">{"\uCE74\uD14C\uACE0\uB9AC"}</div>
      <div className="side-menu-list">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`side-menu-btn ${isItemActive(item.key) ? "active" : ""}`}
            onClick={() => navigate(`/?view=${encodeURIComponent(item.key)}`)}
          >
            <span className={`side-menu-icon side-menu-icon-${item.key}`} aria-hidden="true">
              {item.icon}
            </span>
            <span className="side-menu-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
