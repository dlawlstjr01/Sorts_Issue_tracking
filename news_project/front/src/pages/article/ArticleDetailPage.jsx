import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import SideMenuCard from "../../components/SideMenuCard";
import { getNewsById } from "../../api/newsApi";
import {
  getRememberedArticleDetail,
  rememberArticleDetail,
  toArticleDetailPayload,
} from "../../utils/articleDetail";

function formatPublishedDateTime(raw) {
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw).slice(0, 19).replace("T", " ");
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  const h = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${d} ${h}:${min}`;
}

function extractHost(rawUrl) {
  try {
    const url = new URL(String(rawUrl || ""));
    return String(url.hostname || "").replace(/^www\./, "");
  } catch (_) {
    return "";
  }
}

function splitParagraphs(article) {
  const parts = [article?.content, article?.summary, article?.description]
    .filter(Boolean)
    .join("\n\n")
    .replace(/\r/g, "");

  if (!parts) return [];
  return parts
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveBackTarget(location, fallback) {
  const candidate = String(location.state?.from || "").trim();
  if (!candidate) return fallback;

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(candidate, base);
    const view = url.searchParams.get("view");
    if (view === "article") return fallback;
  } catch (_) {
    return fallback;
  }

  return candidate;
}

function isNumericArticleId(value) {
  return /^\d+$/.test(String(value || "").trim());
}

export default function ArticleDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const articleId = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return String(sp.get("id") || "").trim();
  }, [location.search]);

  const initialArticle = useMemo(() => {
    const fromState = toArticleDetailPayload(location.state?.article);
    if (fromState) {
      rememberArticleDetail(fromState);
      return fromState;
    }

    if (!articleId) return null;
    const fromCache = getRememberedArticleDetail(articleId);
    const normalized = toArticleDetailPayload(fromCache);
    if (normalized) rememberArticleDetail(normalized);
    return normalized;
  }, [articleId, location.state?.article]);

  const [article, setArticle] = useState(initialArticle);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const fetchedArticleIdRef = useRef("");

  const [userId, setUserId] = useState(null);
  const logIdRef = useRef(null);
  const enterTimeRef = useRef(null);
  const scrollCountRef = useRef(0);
  const lastCountedYRef = useRef(0);
  const createdLogForArticleRef = useRef("");
  const updatedLogRef = useRef(false);

  useEffect(() => {
    setArticle(initialArticle);
  }, [initialArticle]);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        setUserId(res.data?.id ?? null);
      } catch (e) {
        if (e?.response?.status === 401) {
          setUserId(null);
          return;
        }
        console.error("[auth/me] failed:", e);
        setUserId(null);
      }
    };

    loadMe();
  }, []);

 useEffect(() => {
  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      scrollCountRef.current += 1;
    }
  };

  window.addEventListener("wheel", handleWheel, { passive: true });

  return () => {
    window.removeEventListener("wheel", handleWheel);
  };
}, []);

  useEffect(() => {
    let mounted = true;

    if (!isNumericArticleId(articleId)) return () => { };
    if (fetchedArticleIdRef.current === articleId) return () => { };
    fetchedArticleIdRef.current = articleId;

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError("");
        const response = await getNewsById(articleId);
        const merged = toArticleDetailPayload({
          ...(initialArticle || {}),
          ...(response?.data || {}),
        });
        if (!mounted) return;
        if (merged) {
          rememberArticleDetail(merged);
          setArticle(merged);
        }
      } catch (err) {
        if (!mounted) return;
        setDetailError(
          err?.response?.data?.message || "기사 본문을 불러오지 못했습니다."
        );
      } finally {
        if (mounted) setDetailLoading(false);
      }
    };

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [articleId, initialArticle]);

  useEffect(() => {
    const createLog = async () => {
      if (!userId) return;
      if (!article) return;

      const currentArticleKey = String(article?.id || articleId || "").trim();
      if (!currentArticleKey) return;
      if (createdLogForArticleRef.current === currentArticleKey) return;

      try {
        const payload = {
          article_id: Number(article?.id) || null,
          url: article?.url || article?.raw?.url || null,
          stay_time: 0,
          scroll_depth: 0,
          action: "view",
        };

        const res = await axios.post("/log", payload, {
          withCredentials: true,
        });

        const savedLogId =
          res.data?.logId ?? res.data?.id ?? res.data?.data?.logId ?? null;

        logIdRef.current = savedLogId;
        enterTimeRef.current = Date.now();
        scrollCountRef.current = 0;
        lastCountedYRef.current =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
        updatedLogRef.current = false;
        createdLogForArticleRef.current = currentArticleKey;
      } catch (e) {
        console.error("log create failed:", e);
      }
    };

    createLog();
  }, [userId, article, articleId]);

  useEffect(() => {
    const sendUpdateLog = () => {
      const logId = logIdRef.current;
      const enterTime = enterTimeRef.current;

      if (!logId || !enterTime) return;
      if (updatedLogRef.current) return;

      updatedLogRef.current = true;

      const dwellMs = Date.now() - enterTime;
      const payload = {
        dwellMs,
        stay_time: Math.max(1, Math.round(dwellMs / 1000)),
        scroll_depth: scrollCountRef.current,
        updatedAt: new Date().toISOString(),
      };

      fetch(`/log/${logId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        keepalive: true,
        body: JSON.stringify(payload),
      }).catch((e) => {
        console.error("log update failed:", e);
      });
    };

    const handlePageHide = () => {
      sendUpdateLog();
    };

    const handleBeforeUnload = () => {
      sendUpdateLog();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      sendUpdateLog();
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const paragraphs = useMemo(() => splitParagraphs(article), [article]);
  const sourceHost = useMemo(() => extractHost(article?.url), [article?.url]);
  const backTarget = useMemo(
    () => resolveBackTarget(location, "/?view=article-list"),
    [location]
  );

  return (
    <div className="page article-detail-page">
      <div className="article-detail-top">
        <button
          type="button"
          className="article-detail-back"
          onClick={() => navigate(backTarget)}
        >
          기사 목록으로
        </button>
      </div>

      {!article ? (
        <div className="article-detail-empty">
          {detailLoading ? (
            <>
              <div className="article-detail-empty-title">기사 본문을 불러오는 중입니다.</div>
              <div className="article-detail-empty-desc">
                잠시만 기다려 주세요.
              </div>
            </>
          ) : (
            <>
              <div className="article-detail-empty-title">기사 정보를 찾을 수 없습니다.</div>
              <div className="article-detail-empty-desc">
                목록에서 기사를 다시 선택해 주세요.
              </div>
              <button
                type="button"
                className="article-detail-back primary"
                onClick={() => navigate("/?view=article-list")}
              >
                기사 목록으로 이동
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <section className="article-detail-hero">
            <div className="article-detail-meta">
              <span className="badge">{article.category || "기타"}</span>
              {article.pressName && (
                <span className="article-detail-press">{article.pressName}</span>
              )}
              <span className="article-detail-date">
                {formatPublishedDateTime(article.publishedAt)}
              </span>
            </div>
            <h1 className="article-detail-title">{article.title}</h1>
          </section>

          <div className="article-detail-grid">
            <section className="article-detail-main">
              {article.thumbnail && (
                <div className="article-detail-thumb-wrap">
                  <img
                    className="article-detail-thumb"
                    src={article.thumbnail}
                    alt="article thumbnail"
                    loading="lazy"
                  />
                </div>
              )}

              <article className="article-detail-content-card">
                <div className="article-detail-content-title">본문</div>
                {detailLoading && (
                  <p className="article-detail-empty-content">
                    본문을 불러오는 중입니다...
                  </p>
                )}
                {detailError && !detailLoading && (
                  <p className="article-detail-empty-content">{detailError}</p>
                )}
                {paragraphs.length > 0 ? (
                  <div className="article-detail-content">
                    {paragraphs.map((line, index) => (
                      <p key={`${article.id}-line-${index}`}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="article-detail-empty-content">
                    본문 텍스트가 없어 요약 정보만 제공됩니다.
                  </p>
                )}
              </article>
            </section>

            <aside className="article-detail-side">
              <SideMenuCard collapsible showScrollTop />

              <div className="article-detail-source-card">
                <div className="article-detail-source-title">원문 정보</div>
                <div className="article-detail-source-row">
                  <span>출처</span>
                  <span>{sourceHost || "-"}</span>
                </div>
                <div className="article-detail-source-row">
                  <span>기사 ID</span>
                  <span>{article.id}</span>
                </div>
                <button
                  type="button"
                  className="article-detail-open-source"
                  onClick={() => {
                    if (!article.url) return;
                    window.open(article.url, "_blank", "noopener,noreferrer");
                  }}
                  disabled={!article.url}
                >
                  {article.url ? "원문 사이트로 이동" : "원문 링크 없음"}
                </button>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}