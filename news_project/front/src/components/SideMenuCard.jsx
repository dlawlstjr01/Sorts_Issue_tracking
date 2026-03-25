import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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

function IconList(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
      <path
        d="M4 6h2v2H4V6Zm4 0h12v2H8V6Zm-4 5h2v2H4v-2Zm4 0h12v2H8v-2Zm-4 5h2v2H4v-2Zm4 0h12v2H8v-2Z"
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
  { key: "main", label: "홈", icon: <IconHome /> },
  { key: "article-list", label: "기사 목록", icon: <IconList /> },
  { key: "issue-report", label: "이슈추적/리포트", icon: <IconReports /> },
  { key: "archive", label: "아카이브", icon: <IconArchive /> },
  { key: "support", label: "고객센터", icon: <IconSupport /> },
];

const SIDE_MENU_COLLAPSED_KEY = "side_menu_collapsed_v2";
const MOBILE_COLLAPSIBLE_QUERY = "(max-width: 960px)";

const getIsMobileViewport = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(MOBILE_COLLAPSIBLE_QUERY).matches;
};

const getSavedCollapsedState = () => {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem(SIDE_MENU_COLLAPSED_KEY);
  if (saved === "true") return true;
  if (saved === "false") return false;
  return false;
};

export default function SideMenuCard({
  collapsible = false,
  mobileCollapsible = false,
  showScrollTop = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const view = new URLSearchParams(location.search).get("view") || "main";
  const [isMobileViewport, setIsMobileViewport] = useState(() => getIsMobileViewport());
  const isCollapsible = collapsible || (mobileCollapsible && isMobileViewport);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (mobileCollapsible && !collapsible) return false;
    if (!collapsible) return false;
    return getSavedCollapsedState();
  });

  useEffect(() => {
    if (!mobileCollapsible) return undefined;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia(MOBILE_COLLAPSIBLE_QUERY);
    const handleChange = (event) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [mobileCollapsible]);

  useEffect(() => {
    if (!isCollapsible) {
      setIsCollapsed(false);
      return;
    }

    if (mobileCollapsible && !collapsible) {
      setIsCollapsed(false);
      return;
    }

    setIsCollapsed(getSavedCollapsedState());
  }, [collapsible, isCollapsible, isMobileViewport, mobileCollapsible]);

  useEffect(() => {
    if (!isCollapsible || !collapsible) return;
    window.localStorage.setItem(SIDE_MENU_COLLAPSED_KEY, String(isCollapsed));
  }, [collapsible, isCollapsible, isCollapsed]);

  const isItemActive = (key) => {
    if (key === "main") return view === "main";
    if (key === "article-list") return view === "article-list";
    if (key === "issue-report") {
      return (
        view === "issue-report" ||
        view === "issues" ||
        view === "issue" ||
        view === "reports" ||
        view === "report"
      );
    }
    return view === key || view.startsWith(`${key}-`);
  };

  return (
    <>
      {isCollapsible && (
        <div className="side-menu-floating-toggle">
          <button
            type="button"
            className="als-fab primary"
            aria-label="빠른 메뉴"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              {isCollapsed ? (
                <path
                  d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"
                  fill="currentColor"
                />
              ) : (
                <path
                  d="M6.22 6.22a1 1 0 0 1 1.41 0L12 10.59l4.37-4.37a1 1 0 0 1 1.41 1.41L13.41 12l4.37 4.37a1 1 0 0 1-1.41 1.41L12 13.41l-4.37 4.37a1 1 0 0 1-1.41-1.41L10.59 12 6.22 7.63a1 1 0 0 1 0-1.41Z"
                  fill="currentColor"
                />
              )}
            </svg>
          </button>
        </div>
      )}

      {isCollapsible && showScrollTop && (
        <div className="side-menu-floating-scroll">
          <button
            type="button"
            className="als-fab dark"
            aria-label="맨 위로"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="m12 6 8 8-1.4 1.4L12 8.8l-6.6 6.6L4 14l8-8Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="side-menu-card"
            className={`side-menu-card ${isCollapsible ? "is-collapsible" : ""}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
          {isCollapsible && (
            <button
              type="button"
              className="side-menu-collapse-arrow"
              aria-label="카테고리 접기"
              onClick={() => setIsCollapsed(true)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="m12 18-8-8 1.4-1.4L12 15.2l6.6-6.6L20 10l-8 8Z" fill="currentColor" />
              </svg>
            </button>
          )}

          <div className="side-menu-title">카테고리</div>

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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
