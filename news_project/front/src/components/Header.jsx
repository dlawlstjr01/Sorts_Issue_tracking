import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function IconBox(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        d="M12 2 3 6.5V17.5L12 22l9-4.5V6.5L12 2Zm0 2.3 6.8 3.4L12 11.1 5.2 7.7 12 4.3ZM5 9.2l6 3v7.5l-6-3V9.2Zm14 0v7.5l-6 3v-7.5l6-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        d="M4 20V4h2v14h14v2H4Zm4-4V9h2v7H8Zm4 0V6h2v10h-2Zm4 0v-5h2v5h-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconSupport(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        d="M12 2a8 8 0 0 0-8 8v3a3 3 0 0 0 3 3h1v-6H7a1 1 0 0 0-1 1v2H5v-3a7 7 0 1 1 14 0v3h-1v-2a1 1 0 0 0-1-1h-1v7a3 3 0 0 1-3 3h-3v-2h3a1 1 0 0 0 1-1v-1h-1a3 3 0 0 0-3 3v1h-2v-1a5 5 0 0 1 5-5h1v-4a8 8 0 0 0-8-8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconArchive(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path d="M4 4h16v4H4V4Zm1 6h14v10H5V10Zm4 2v2h6v-2H9Zm-3-6v2h12V6H6Z" fill="currentColor" />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const view = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("view") || "issues";
  }, [location.search]);

  const menu = useMemo(
    () => [
      { to: "issues", label: "이슈 추적", icon: <IconBox /> },
      { to: "reports", label: "요약/리포트", icon: <IconChart /> },
      { to: "archive", label: "아카이브", icon: <IconArchive /> },
      { to: "support", label: "고객센터", icon: <IconSupport /> },
    ],
    []
  );

  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  return (
    <header className="hdr">
      <div className="hdr-inner">
        <button className="hdr-logo" type="button" onClick={() => go("issues")}>
          <span className="hdr-mark">NEWS</span>
          <span className="hdr-sub">Issue Tracker</span>
        </button>

        <nav className="hdr-nav" aria-label="Primary">
          {menu.map((m) => (
            <button
              key={m.to}
              type="button"
              className={`hdr-item ${view === m.to || view.startsWith(m.to + "-") ? "is-active" : ""}`}
              onClick={() => go(m.to)}
            >
              <span className="hdr-ico">{m.icon}</span>
              <span className="hdr-text">{m.label}</span>
            </button>
          ))}
        </nav>

        <button className="hdr-login" type="button" onClick={() => go("login")}>
          <IconUser />
          <span>로그인</span>
        </button>
      </div>
    </header>
  );
}
