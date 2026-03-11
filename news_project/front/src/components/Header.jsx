import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";

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

function IconList(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        d="M4 6h2v2H4V6Zm4 0h12v2H8V6Zm-4 5h2v2H4v-2Zm4 0h12v2H8v-2Zm-4 5h2v2H4v-2Zm4 0h12v2H8v-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        d="M10 17v-2h4v-2h-4v-2l-3 3 3 3Zm-6 4h10a2 2 0 0 0 2-2v-3h-2v3H4V5h10v3h2V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Zm12-6v-2h6v-2h-6V9l-4 3 4 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Header() {
  const NAV_DRAG_ACTIVATION_PX = 14;
  const NAV_DRAG_ACTIVATION_ON_ITEM_PX = 24;
  const NAV_CLICK_SUPPRESS_MS = 120;
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const navClickSuppressUntilRef = useRef(0);
  const navDragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startedOnItem: false,
    isDragging: false,
  });

  const view = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("view") || "main";
  }, [location.search]);

  const activeView = useMemo(() => {
    if (view === "issue") return "issues";
    if (view === "report") return "reports";
    return view;
  }, [view]);

  const menu = useMemo(
    () => [
      { to: "article-list", label: "기사 목록", icon: <IconList /> },
      { to: "issues", label: "이슈 추적", icon: <IconBox /> },
      { to: "reports", label: "요약/리포트", icon: <IconChart /> },
      { to: "archive", label: "아카이브", icon: <IconArchive /> },
      { to: "support", label: "고객센터", icon: <IconSupport /> },
    ],
    []
  );

  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  const [auth, setAuth] = useState({
    checked: false,
    loggedIn: false,
    login_id: "",
  });

  // 로그아웃 진행 상태(버튼 잠금 + 텍스트 변경)
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isNavDragging, setIsNavDragging] = useState(false);

  const stopNavDrag = (pointerId) => {
    const nav = navRef.current;
    if (!navDragRef.current.active) return;
    if (navDragRef.current.isDragging) {
      navClickSuppressUntilRef.current = Date.now() + NAV_CLICK_SUPPRESS_MS;
    }
    const capturedPointerId =
      pointerId ?? navDragRef.current.pointerId;
    navDragRef.current.active = false;
    navDragRef.current.pointerId = null;
    navDragRef.current.isDragging = false;
    if (capturedPointerId != null && nav?.hasPointerCapture?.(capturedPointerId)) {
      nav.releasePointerCapture(capturedPointerId);
    }
    setIsNavDragging(false);
  };

  const handleNavPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const nav = navRef.current;
    if (!nav) return;
    if (nav.scrollWidth <= nav.clientWidth + 2) return;
    navDragRef.current.active = true;
    navDragRef.current.pointerId = e.pointerId;
    navDragRef.current.startX = e.clientX;
    navDragRef.current.startY = e.clientY;
    navDragRef.current.startScrollLeft = nav.scrollLeft;
    navDragRef.current.startedOnItem = Boolean(
      e.target?.closest?.(".hdr-item")
    );
    navDragRef.current.isDragging = false;
    setIsNavDragging(false);
  };

  const handleNavPointerMove = (e) => {
    if (!navDragRef.current.active) return;
    const nav = navRef.current;
    if (!nav) return;
    const dx = e.clientX - navDragRef.current.startX;
    const dy = e.clientY - navDragRef.current.startY;
    const activationPx = navDragRef.current.startedOnItem
      ? NAV_DRAG_ACTIVATION_ON_ITEM_PX
      : NAV_DRAG_ACTIVATION_PX;

    if (!navDragRef.current.isDragging) {
      if (
        Math.abs(dx) < activationPx ||
        Math.abs(dx) <= Math.abs(dy)
      ) {
        return;
      }
      navDragRef.current.isDragging = true;
      setIsNavDragging(true);
      nav.setPointerCapture?.(e.pointerId);
    }

    nav.scrollLeft = navDragRef.current.startScrollLeft - dx;
    e.preventDefault();
  };

  const handleNavClickCapture = (e) => {
    if (Date.now() >= navClickSuppressUntilRef.current) return;
    e.preventDefault();
    e.stopPropagation();
  };

 const refreshAuth = async () => {
  try {
    const res = await axios.get("/auth/me", { withCredentials: true });

    const id = res.data?.id ?? null;
    if (!id) {
      setAuth({ checked: true, loggedIn: false, login_id: "" });
      return;
    }

    setAuth({
      checked: true,
      loggedIn: true,
      login_id: res.data?.login_id || "",
    });
  } catch (e) {
    setAuth({ checked: true, loggedIn: false, login_id: "" });
  }
};

  useEffect(() => {
    refreshAuth();
  }, [location.search]);

  //  약간 지연
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await axios.post(`/auth/logout`, null, {
        withCredentials: true,
      });

      // (0.5초)
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      // 세션 만료 등으로 실패해도 사용자 입장에선 로그아웃 처리
      await new Promise((r) => setTimeout(r, 300));
    } finally {
      setAuth({ checked: true, loggedIn: false, login_id: "" });
      setLoggingOut(false);
      go("main");
    }
  };

  return (
    <header className="hdr">
      <div className="hdr-inner">
        <button className="hdr-logo" type="button" onClick={() => go("main")}>
          <img className="hdr-logo-img" src={logoImg} alt="" aria-hidden="true" />
          <span className="hdr-logo-text">
            <span className="hdr-mark">NEWS</span>
            <span className="hdr-sub">Issue Tracker</span>
          </span>
        </button>

        <nav
          ref={navRef}
          className={`hdr-nav hdr-nav-draggable ${isNavDragging ? "is-dragging" : ""}`}
          aria-label="Primary"
          onPointerDown={handleNavPointerDown}
          onPointerMove={handleNavPointerMove}
          onPointerUp={(e) => stopNavDrag(e.pointerId)}
          onPointerCancel={(e) => stopNavDrag(e.pointerId)}
          onPointerLeave={() => {
            if (navDragRef.current.active && !navDragRef.current.isDragging) {
              stopNavDrag(null);
            }
          }}
          onLostPointerCapture={() => stopNavDrag(null)}
          onClickCapture={handleNavClickCapture}
        >
          {menu.map((m) => (
            <button
              key={m.to}
              type="button"
              className={`hdr-item ${
                activeView && (activeView === m.to || activeView.startsWith(m.to + "-")) ? "is-active" : ""
              }`}
              onClick={() => go(m.to)}
            >
              <span className="hdr-ico">{m.icon}</span>
              <span className="hdr-text">{m.label}</span>
            </button>
          ))}
        </nav>

        <div className="hdr-right">
          {!auth.checked ? (
            <button className="hdr-btn" type="button" disabled>
              <IconUser />
              <span>...</span>
            </button>
          ) : auth.loggedIn ? (
            <>
              <button className="hdr-btn" type="button" onClick={() => go("mypage")} disabled={loggingOut}>
                <IconUser />
                <span>마이페이지</span>
              </button>

              <button
                className="hdr-btn"
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                disabled={loggingOut}
              >
                <IconLogout />
                <span>{loggingOut ? "로그아웃 중..." : "로그아웃"}</span>
              </button>
            </>
          ) : (
            <button className="hdr-btn" type="button" onClick={() => go("login")}>
              <IconUser />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>

      {logoutConfirmOpen && (
        <div
          className="my-notice-modal-backdrop"
          onClick={() => {
            if (!loggingOut) setLogoutConfirmOpen(false);
          }}
        >
          <div className="my-notice-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h4 className="my-notice-title">알림</h4>
            <p className="my-notice-message">로그아웃 하시겠습니까?</p>
            <div className="my-notice-actions">
              <button
                className="login-btn"
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                disabled={loggingOut}
              >
                취소
              </button>
              <button
                className="login-btn primary"
                type="button"
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  handleLogout();
                }}
                disabled={loggingOut}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
