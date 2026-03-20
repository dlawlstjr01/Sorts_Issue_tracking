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

function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-4V17l-1.5-1.5V11a5.5 5.5 0 0 0-4.5-5.4V4a1 1 0 1 0-2 0v1.6A5.5 5.5 0 0 0 6.5 11v4.5L5 17v1h14Z"
        fill="currentColor"
      />
    </svg>
  );
}

const INTEREST_KEYWORD_STORAGE_KEYS = [
  "archiveInterestKeywords",
  "interestKeywords",
  "myInterestKeywords",
  "userInterestKeywords",
  "preferredKeywords",
];
const NOTIFY_FETCH_LIMIT = 80;
const NOTIFY_POLL_INTERVAL_MS = 12000;
const NOTIFY_MAX_ITEMS = 20;
const MAIN_PAGE_STATE_KEY = "mainPageViewState";

function toEpoch(value) {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function buildNotificationSearchText(candidate) {
  return [candidate?.title, candidate?.summary]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildNotificationSignature(candidate) {
  return [
    String(candidate?.key || ""),
    String(candidate?.updatedAt || ""),
    String(candidate?.title || ""),
    String(candidate?.summary || ""),
  ].join("::");
}

function mergeNotificationItems(nextItems, prevItems) {
  const dedupe = new Set();
  const merged = [];

  [...nextItems, ...prevItems].forEach((item) => {
    const dedupeKey = String(item?.articleKey || item?.id || "");
    if (!dedupeKey || dedupe.has(dedupeKey)) return;
    dedupe.add(dedupeKey);
    merged.push(item);
  });

  return merged.slice(0, NOTIFY_MAX_ITEMS);
}

function normalizeKeywordList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const keywords = [];
  value.forEach((item) => {
    const raw =
      typeof item === "string"
        ? item
        : item && typeof item === "object"
          ? item.label ?? item.keyword ?? item.name ?? ""
          : "";
    const keyword = String(raw || "").trim();
    const dedupe = keyword.toLowerCase();
    if (!keyword || seen.has(dedupe)) return;
    seen.add(dedupe);
    keywords.push(keyword);
  });
  return keywords;
}

function readStoredInterestKeywords() {
  if (typeof window === "undefined") return [];
  for (const key of INTEREST_KEYWORD_STORAGE_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const normalized = normalizeKeywordList(parsed);
      if (normalized.length > 0) return normalized;
    } catch {
      // ignore malformed values
    }
  }
  return [];
}

function mapIssueToNotificationCandidate(issue) {
  const relatedArticles = Array.isArray(issue?.related_articles) ? issue.related_articles : [];
  const representative =
    relatedArticles.find(
      (article) =>
        Number(article?.is_representative || 0) === 1 ||
        String(article?.id || article?.article_id || "") === String(issue?.article_id || "")
    ) || relatedArticles[0] || null;

  const title = String(representative?.title || issue?.title || "").trim();
  const summary = String(
    issue?.short_summary ||
    issue?.ultra_short ||
    issue?.summary ||
    representative?.short_summary ||
    representative?.ultra_short ||
    representative?.summary ||
    representative?.description ||
    ""
  ).trim();

  const updatedAt =
    issue?.updated_at ||
    representative?.updated_at ||
    representative?.published_at ||
    representative?.created_at ||
    issue?.created_at ||
    "";

  const articleKey = String(
    issue?.article_id ||
    representative?.article_id ||
    representative?.id ||
    issue?.id ||
    `${title}_${updatedAt}`
  );
  const articleId = String(
    representative?.article_id ||
    representative?.id ||
    issue?.article_id ||
    issue?.id ||
    ""
  );
  const thumbnail = String(representative?.thumbnail || representative?.thumbnail_url || representative?.thumbnailUrl || "").trim();
  const pressName = String(representative?.press_name || representative?.press || issue?.press_name || issue?.press || "").trim();
  const publishedAt = String(
    representative?.published_at ||
    representative?.created_at ||
    issue?.published_at ||
    issue?.created_at ||
    updatedAt ||
    ""
  );

  return {
    key: articleKey,
    articleId,
    title: title || "제목 없음",
    summary,
    updatedAt: String(updatedAt || ""),
    publishedAt,
    category: String(representative?.category || issue?.category || ""),
    thumbnail,
    pressName,
    url: String(representative?.url || issue?.url || ""),
  };
}

function formatRelativeTime(value) {
  const ts = new Date(value).getTime();
  if (!Number.isFinite(ts)) return "방금";
  const diffSec = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return `${diffSec}초 전`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

export default function Header() {
  const NAV_DRAG_ACTIVATION_PX = 14;
  const NAV_DRAG_ACTIVATION_ON_ITEM_PX = 24;
  const NAV_CLICK_SUPPRESS_MS = 120;
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const notifyAnchorRef = useRef(null);
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
    if (
      view === "issue-report" ||
      view === "issues" ||
      view === "issue" ||
      view === "reports" ||
      view === "report"
    ) {
      return "issue-report";
    }
    return view;
  }, [view]);

  const menu = useMemo(
    () => [
      { to: "article-list", label: "기사 목록", icon: <IconList /> },
      { to: "issue-report", label: "이슈 추적/리포트", icon: <IconChart /> },
      { to: "archive", label: "아카이브", icon: <IconArchive /> },
      { to: "support", label: "고객센터", icon: <IconSupport /> },
    ],
    []
  );

  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  const handleLogoHome = () => {
    try {
      sessionStorage.removeItem(MAIN_PAGE_STATE_KEY);
    } catch (e) {
      console.error("failed to reset main page state:", e);
    }

    navigate("/?view=main", {
      state: {
        resetMainPage: Date.now(),
      },
    });
  };

  const [auth, setAuth] = useState({
    checked: false,
    loggedIn: false,
    login_id: "",
  });

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [isNavDragging, setIsNavDragging] = useState(false);
  const [notifyItems, setNotifyItems] = useState([]);
  const [notifyUnreadCount, setNotifyUnreadCount] = useState(0);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyHasError, setNotifyHasError] = useState(false);
  const [notifyKeywordCount, setNotifyKeywordCount] = useState(0);
  const notifyInitializedRef = useRef(false);
  const notifySeenSignaturesRef = useRef(new Set());
  const notifySeenKeysRef = useRef(new Set());
  const notifyKeywordFingerprintRef = useRef("");
  const notifyOpenRef = useRef(false);

  const stopNavDrag = (pointerId) => {
    const nav = navRef.current;
    if (!navDragRef.current.active) return;
    if (navDragRef.current.isDragging) {
      navClickSuppressUntilRef.current = Date.now() + NAV_CLICK_SUPPRESS_MS;
    }
    const capturedPointerId = pointerId ?? navDragRef.current.pointerId;
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
    navDragRef.current.startedOnItem = Boolean(e.target?.closest?.(".hdr-item"));
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
      if (Math.abs(dx) < activationPx || Math.abs(dx) <= Math.abs(dy)) {
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

  useEffect(() => {
    setNotifyOpen(false);
  }, [location.search]);

  useEffect(() => {
    notifyOpenRef.current = notifyOpen;
    if (!notifyOpen) return;
    setNotifyUnreadCount(0);
    setNotifyItems((prev) => prev.map((item) => (item.isRead ? item : { ...item, isRead: true })));
  }, [notifyOpen]);

  useEffect(() => {
    if (auth.loggedIn) return;
    setNotifyItems([]);
    setNotifyUnreadCount(0);
    setNotifyLoading(false);
    setNotifyHasError(false);
    setNotifyKeywordCount(0);
    notifyInitializedRef.current = false;
    notifySeenSignaturesRef.current = new Set();
    notifySeenKeysRef.current = new Set();
    notifyKeywordFingerprintRef.current = "";
  }, [auth.loggedIn]);

  useEffect(() => {
    if (!auth.loggedIn) return undefined;

    let mounted = true;
    let inFlight = false;

    const syncNotifications = async () => {
      if (inFlight) return;
      inFlight = true;

      const normalizedKeywords = readStoredInterestKeywords()
        .map((keyword) => String(keyword || "").trim())
        .filter(Boolean)
        .map((keyword) => ({ original: keyword, lower: keyword.toLowerCase() }));
      const keywordFingerprint = normalizedKeywords
        .map((item) => item.lower)
        .sort()
        .join("|");

      if (keywordFingerprint !== notifyKeywordFingerprintRef.current) {
        notifyKeywordFingerprintRef.current = keywordFingerprint;
        notifyInitializedRef.current = false;
        notifySeenSignaturesRef.current = new Set();
        notifySeenKeysRef.current = new Set();
        if (mounted) {
          setNotifyItems([]);
          setNotifyUnreadCount(0);
        }
      }

      if (mounted) {
        setNotifyKeywordCount(normalizedKeywords.length);
      }

      if (normalizedKeywords.length === 0) {
        if (mounted) {
          setNotifyHasError(false);
          setNotifyLoading(false);
        }
        notifyInitializedRef.current = true;
        inFlight = false;
        return;
      }

      if (mounted && !notifyInitializedRef.current) {
        setNotifyLoading(true);
      }

      try {
        const res = await axios.get("/tracking/issues", {
          params: { limit: NOTIFY_FETCH_LIMIT },
        });
        if (!mounted) {
          inFlight = false;
          return;
        }

        const sourceItems = res.data?.items || res.data?.issues || res.data?.data || [];
        const issueItems = Array.isArray(sourceItems) ? sourceItems : [];
        const mappedCandidates = issueItems
          .map(mapIssueToNotificationCandidate)
          .filter((candidate) => candidate && candidate.key);

        const baselineItems = [];
        const incomingItems = [];

        mappedCandidates.forEach((candidate) => {
          const searchText = buildNotificationSearchText(candidate);
          if (!searchText) return;

          const matchedKeywords = normalizedKeywords
            .filter(({ lower }) => searchText.includes(lower))
            .map(({ original }) => original);
          if (matchedKeywords.length === 0) return;

          const signature = buildNotificationSignature(candidate);
          const articleKey = String(candidate.key || "");
          const isKnownKey = notifySeenKeysRef.current.has(articleKey);
          const isKnownSignature = notifySeenSignaturesRef.current.has(signature);

          notifySeenKeysRef.current.add(articleKey);
          notifySeenSignaturesRef.current.add(signature);

          const nextItem = {
            id: signature,
            signature,
            articleKey,
            articleId: candidate.articleId,
            title: candidate.title,
            summary: candidate.summary,
            category: candidate.category,
            updatedAt: candidate.updatedAt,
            publishedAt: candidate.publishedAt,
            thumbnail: candidate.thumbnail,
            pressName: candidate.pressName,
            url: candidate.url,
            matchedKeywords,
            eventType: isKnownKey ? "updated" : "new",
            isRead: notifyOpenRef.current,
          };

          if (!notifyInitializedRef.current) {
            baselineItems.push({ ...nextItem, isRead: true });
            return;
          }

          if (isKnownSignature) return;
          incomingItems.push(nextItem);
        });

        if (!notifyInitializedRef.current) {
          const sortedBaseline = baselineItems
            .sort((a, b) => toEpoch(b.updatedAt) - toEpoch(a.updatedAt))
            .slice(0, NOTIFY_MAX_ITEMS);
          setNotifyItems(sortedBaseline);
          setNotifyUnreadCount(0);
          notifyInitializedRef.current = true;
        } else if (incomingItems.length > 0) {
          const sortedIncoming = incomingItems.sort((a, b) => toEpoch(b.updatedAt) - toEpoch(a.updatedAt));
          setNotifyItems((prev) => mergeNotificationItems(sortedIncoming, prev));
          if (!notifyOpenRef.current) {
            setNotifyUnreadCount((prev) => Math.min(99, prev + sortedIncoming.length));
          }
        }

        setNotifyHasError(false);
      } catch (e) {
        if (mounted) setNotifyHasError(true);
      } finally {
        if (mounted) setNotifyLoading(false);
        inFlight = false;
      }
    };

    syncNotifications();
    const timer = window.setInterval(syncNotifications, NOTIFY_POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [auth.loggedIn]);

  useEffect(() => {
    if (!notifyOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!notifyAnchorRef.current) return;
      if (!notifyAnchorRef.current.contains(event.target)) {
        setNotifyOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setNotifyOpen(false);
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [notifyOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await axios.post(`/auth/logout`, null, {
        withCredentials: true,
      });

      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      await new Promise((r) => setTimeout(r, 300));
    } finally {
      setAuth({ checked: true, loggedIn: false, login_id: "" });
      setLoggingOut(false);
      go("main");
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifyUnreadCount(0);
    setNotifyItems((prev) => prev.map((item) => (item.isRead ? item : { ...item, isRead: true })));
  };

  const handleNotificationSelect = async (item) => {
    if (!item) return;

    const wasUnread = !item.isRead;
    setNotifyItems((prev) =>
      prev.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry))
    );
    if (wasUnread) {
      setNotifyUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifyOpen(false);

    const targetUrl = String(item.url || "").trim();
    const articleId = String(item.articleId || item.articleKey || item.id || "").trim();
    const fallbackPayload = {
      id: articleId || `url:${targetUrl || item.title}`,
      title: item.title || "제목 없음",
      content: "",
      summary: "",
      description: "",
      category: item.category || "",
      thumbnail: item.thumbnail || "",
      press_name: item.pressName || "",
      url: targetUrl,
      published_at: item.publishedAt || item.updatedAt || "",
      updated_at: item.updatedAt || "",
      created_at: item.updatedAt || "",
    };
    let detailPayload = fallbackPayload;

    if (/^\d+$/.test(articleId)) {
      try {
        const res = await axios.get(`/news/${encodeURIComponent(articleId)}`);
        const fetched = res?.data && typeof res.data === "object" ? res.data : {};
        detailPayload = {
          ...fallbackPayload,
          ...fetched,
          id: String(fetched?.id ?? articleId),
        };
      } catch {
        // fallback
      }
    }

    const sp = new URLSearchParams();
    sp.set("view", "article");
    sp.set("id", detailPayload.id);

    navigate(
      { pathname: "/", search: `?${sp.toString()}` },
      {
        state: {
          article: detailPayload,
          from: `${location.pathname}${location.search}`,
        },
      }
    );
  };

  const notifyEmptyMessage = notifyHasError
    ? "알림 목록을 불러오지 못했습니다."
    : notifyLoading
      ? "알림 목록을 불러오는 중입니다."
      : notifyKeywordCount === 0
        ? "관심 키워드를 등록하면 알림이 표시됩니다."
        : "관심 키워드와 일치한 신규 기사 알림이 없습니다.";

  return (
    <header className="hdr">
      <div className="hdr-inner">
        <button className="hdr-logo" type="button" onClick={handleLogoHome}>
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
              className={`hdr-item ${activeView && (activeView === m.to || activeView.startsWith(m.to + "-")) ? "is-active" : ""
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

              <div className="hdr-notify-anchor" ref={notifyAnchorRef}>
                <button
                  className={`hdr-btn hdr-notify-btn ${notifyOpen ? "is-open" : ""}`}
                  type="button"
                  aria-label="알림"
                  aria-expanded={notifyOpen}
                  onClick={() => setNotifyOpen((prev) => !prev)}
                  disabled={loggingOut}
                >
                  <IconBell />
                  <span>알림</span>
                  {notifyUnreadCount > 0 && (
                    <span className="hdr-notify-badge">
                      {notifyUnreadCount > 99 ? "99+" : notifyUnreadCount}
                    </span>
                  )}
                </button>

                {notifyOpen && (
                  <div className="hdr-notify-menu" role="dialog" aria-label="알림 메뉴">
                    <div className="hdr-notify-head">
                      <div className="hdr-notify-head-main">
                        <strong>알림</strong>
                        {notifyUnreadCount > 0 && (
                          <span className="hdr-notify-unread">{notifyUnreadCount}건 미확인</span>
                        )}
                      </div>
                      <div className="hdr-notify-head-actions">
                        {notifyItems.length > 0 && (
                          <button
                            type="button"
                            className="hdr-notify-mark-read"
                            onClick={handleMarkAllNotificationsRead}
                          >
                            전체 읽음
                          </button>
                        )}
                        <button
                          type="button"
                          className="hdr-notify-close"
                          onClick={() => setNotifyOpen(false)}
                          aria-label="알림 닫기"
                        >
                          닫기
                        </button>
                      </div>
                    </div>

                    <ul className="hdr-notify-list">
                      {notifyItems.length === 0 ? (
                        <li className="hdr-notify-empty">{notifyEmptyMessage}</li>
                      ) : (
                        notifyItems.map((item) => (
                          <li
                            key={item.id}
                            className={`hdr-notify-item ${item.isRead ? "" : "is-unread"}`}
                          >
                            <button
                              type="button"
                              className="hdr-notify-item-btn"
                              onClick={() => handleNotificationSelect(item)}
                            >
                              <div className="hdr-notify-item-head">
                                <div className="hdr-notify-title">{item.title}</div>
                                <span
                                  className={`hdr-notify-kind ${item.eventType === "updated" ? "is-updated" : "is-new"
                                    }`}
                                >
                                  {item.eventType === "updated" ? "업데이트" : "신규"}
                                </span>
                              </div>
                              <div className="hdr-notify-meta">
                                {formatRelativeTime(item.updatedAt)}
                                {item.summary
                                  ? ` · ${item.summary.length > 90 ? `${item.summary.slice(0, 90)}...` : item.summary}`
                                  : ""}
                              </div>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
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