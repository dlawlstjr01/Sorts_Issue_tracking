import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import SideMenuCard from "../../components/SideMenuCard";
import GlossaryText from "../../components/GlossaryText";
import { getNewsById, searchKoreanDictionary } from "../../api/newsApi";
import { fetchGlossary } from "../../utils/searchService";
import {
  ARCHIVE_STORAGE_KEY,
  getArchiveItemKey,
  getArchiveKeySet,
  toggleArchiveItem,
} from "../../utils/archiveStorage";
import { addRecentItem } from "../../utils/recentStorage";
import {
  getRememberedArticleDetail,
  rememberArticleDetail,
  toArticleDetailPayload,
} from "../../utils/articleDetail";
import { withImageFallback } from "../../utils/imageUrl";

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

function isLikelyReporterLine(line) {
  const text = String(line || "").replace(/\s+/g, " ").trim();
  if (!text) return true;

  if (/^[가-힣]{2,5}\s*기자$/.test(text)) return true;
  if (/^(디지털랩|디지털뉴스팀|온라인뉴스팀|뉴스팀|편집국)$/i.test(text)) return true;
  if (/기자\s*$/.test(text) && text.length <= 24) return true;

  return false;
}

function isSentenceLikeLine(line) {
  const text = String(line || "").trim();
  if (!text) return false;
  if (/[.!?。！？…]/.test(text)) return true;
  if (text.length >= 14 && /다$/.test(text)) return true;
  return false;
}

function looksLikeTailNoise(lines, startIndex) {
  const window = lines.slice(startIndex, startIndex + 5);
  if (window.length < 4) return false;

  const nonSentenceCount = window.filter((line) => !isSentenceLikeLine(line)).length;
  return nonSentenceCount >= 4;
}

function splitParagraphs(article) {
  const content = String(article?.content ?? article?.body ?? "").replace(/\r/g, "");
  if (!content.trim()) return [];

  const rawLines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const deduped = [];
  const seen = new Set();

  for (const line of rawLines) {
    if (isLikelyReporterLine(line)) continue;
    if (/^(관련기사|태그|키워드|해시태그)$/i.test(line)) continue;

    const key = line.replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }

  const cleaned = [];

  for (let i = 0; i < deduped.length; i += 1) {
    const line = deduped[i];
    if (!line) continue;

    if (looksLikeTailNoise(deduped, i)) {
      const meaningfulCount = cleaned.filter((item) => isSentenceLikeLine(item)).length;
      if (meaningfulCount >= 3) break;
    }

    cleaned.push(line);
  }

  return cleaned.length > 0 ? cleaned : deduped;
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

const CATEGORY_LABELS = {
  politics: "정치",
  economy: "경제",
  society: "사회",
  world: "국제",
  it: "IT/과학",
  culture: "문화",
  sports: "스포츠",
};

const CATEGORY_RULES = {
  politics: ["국회", "대통령", "총리", "정당", "선거", "공천", "탄핵", "외교", "정부", "장관", "의원", "정책", "국정"],
  economy: [
    "금리",
    "물가",
    "환율",
    "주가",
    "증시",
    "코스피",
    "코스닥",
    "비트코인",
    "가상자산",
    "부동산",
    "경제",
    "경기",
    "실적",
    "매출",
    "영업이익",
    "투자",
    "수출",
    "수입",
    "고용",
    "실업",
    "인플레이션",
  ],
  society: [
    "사건",
    "사고",
    "범죄",
    "경찰",
    "검찰",
    "법원",
    "재판",
    "구속",
    "화재",
    "붕괴",
    "실종",
    "폭행",
    "사망",
    "노동",
    "파업",
    "교육",
    "학교",
    "복지",
    "의료",
    "질병",
  ],
  world: ["미국", "중국", "일본", "러시아", "우크라이나", "유럽", "EU", "UN", "이스라엘", "가자", "중동", "나토", "해외", "국제", "외신", "정상회담", "관세"],
  it: [
    "AI",
    "인공지능",
    "챗GPT",
    "오픈AI",
    "구글",
    "애플",
    "메타",
    "MS",
    "마이크로소프트",
    "엔비디아",
    "반도체",
    "스마트폰",
    "보안",
    "해킹",
    "클라우드",
    "데이터",
    "서버",
    "알고리즘",
    "로봇",
    "과학",
    "우주",
  ],
  culture: ["영화", "드라마", "OTT", "넷플릭스", "디즈니", "음악", "가수", "아이돌", "공연", "전시", "미술", "문학", "문화", "축제", "패션", "연예", "방송"],
  sports: ["축구", "야구", "농구", "배구", "골프", "테니스", "UFC", "EPL", "K리그", "MLB", "NBA", "KBO", "올림픽", "월드컵", "선수", "감독", "경기", "득점"],
};

function normalizeText(s) {
  return String(s || "").toLowerCase();
}

function inferCategoryFromNews(n) {
  const text = normalizeText(
    [n?.title, n?.description, n?.summary, n?.content, n?.body, n?.pressName, n?.press_name]
      .filter(Boolean)
      .join(" ")
  );

  if (!text) return "society";

  let bestKey = "society";
  let bestScore = 0;

  for (const [key, keywords] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(String(kw).toLowerCase())) score += 1;
    }
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  }

  return bestScore > 0 ? bestKey : "society";
}

function getCategoryLabel(key) {
  return CATEGORY_LABELS[key] || "기타";
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

  const [searchInput, setSearchInput] = useState("");
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [dictionaryError, setDictionaryError] = useState("");
  const [dictionaryResults, setDictionaryResults] = useState([]);
  const [dictionaryTotal, setDictionaryTotal] = useState(0);
  const [dictionaryKeyword, setDictionaryKeyword] = useState("");
  const [archiveKeys, setArchiveKeys] = useState(() => getArchiveKeySet());
  const [glossaryList, setGlossaryList] = useState([]);

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
    setSearchInput("");
    setDictionaryLoading(false);
    setDictionaryError("");
    setDictionaryResults([]);
    setDictionaryTotal(0);
    setDictionaryKeyword("");
  }, [article?.id]);

  useEffect(() => {
    setArchiveKeys(getArchiveKeySet());
  }, [article?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadGlossary = async () => {
      try {
        const glossary = await fetchGlossary();
        if (!cancelled) {
          setGlossaryList(Array.isArray(glossary) ? glossary : []);
        }
      } catch (error) {
        console.error("용어 사전 불러오기 실패:", error);
        if (!cancelled) setGlossaryList([]);
      }
    };

    loadGlossary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!article) return;
    const payload = {
      ...article,
      published_at: article.publishedAt,
      created_at: article.publishedAt,
    };
    addRecentItem(payload);
  }, [article?.id]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === ARCHIVE_STORAGE_KEY) {
        setArchiveKeys(getArchiveKeySet());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

    if (!isNumericArticleId(articleId)) return () => {};
    if (fetchedArticleIdRef.current === articleId) return () => {};
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

  const displayCategory = useMemo(() => {
    if (!article) return "society";

    const rawCategory = String(article.category || "").trim().toLowerCase();

    if (
      rawCategory &&
      rawCategory !== "기타" &&
      rawCategory !== "etc" &&
      rawCategory !== "all"
    ) {
      return rawCategory;
    }

    return inferCategoryFromNews(article);
  }, [article]);

  const backTarget = useMemo(
    () => resolveBackTarget(location, "/?view=article-list"),
    [location]
  );

  const isSaved = useMemo(() => {
    if (!article) return false;
    const key = getArchiveItemKey(article);
    return key ? archiveKeys.has(key) : false;
  }, [article, archiveKeys]);

  const handleToggleArchive = () => {
    if (!article) return;
    const payload = {
      ...article,
      published_at: article.publishedAt,
      created_at: article.publishedAt,
    };
    const result = toggleArchiveItem(payload);
    setArchiveKeys(getArchiveKeySet(result.items));
  };

  const handleDictionarySearch = async () => {
    const keyword = searchInput.trim();

    setDictionaryKeyword(keyword);
    setDictionaryError("");
    setDictionaryResults([]);
    setDictionaryTotal(0);

    if (!keyword) return;

    try {
      setDictionaryLoading(true);
      const result = await searchKoreanDictionary(keyword);

      setDictionaryResults(result.items || []);
      setDictionaryTotal(result.total || 0);

      if (!result.items || result.items.length === 0) {
        setDictionaryError("사전 검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("dictionary search failed:", error);
      setDictionaryError(error?.message || "사전 검색 중 오류가 발생했습니다.");
      setDictionaryResults([]);
      setDictionaryTotal(0);
    } finally {
      setDictionaryLoading(false);
    }
  };

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
        <button
          type="button"
          className={`article-detail-save ${isSaved ? "active" : ""}`}
          aria-pressed={isSaved}
          onClick={handleToggleArchive}
          disabled={!article}
        >
          {isSaved ? "저장됨" : "저장"}
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
              <span className="badge">{getCategoryLabel(displayCategory)}</span>
              {article.pressName && (
                <span className="article-detail-press">{article.pressName}</span>
              )}
              <span className="article-detail-date">
                {formatPublishedDateTime(article.publishedAt)}
              </span>
            </div>

            <h1 className="article-detail-title">
              <GlossaryText text={article.title || ""} glossary={glossaryList} />
            </h1>
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
                    onError={withImageFallback}
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
                      <p key={`${article.id}-line-${index}`}>
                        <GlossaryText text={line} glossary={glossaryList} />
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="article-detail-empty-content">
                    본문 텍스트가 없어 요약 정보만 제공합니다.
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

                <div className="article-detail-search">
                  <label
                    className="article-detail-search-label"
                    htmlFor="article-detail-search"
                  >
                    국립국어원 사전 검색
                  </label>

                  <div className="article-detail-search-controls">
                    <div className="article-detail-search-input">
                      <input
                        id="article-detail-search"
                        type="text"
                        placeholder="뜻을 검색할 단어를 입력하세요."
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            void handleDictionarySearch();
                          }
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="article-detail-search-btn"
                      onClick={() => void handleDictionarySearch()}
                      disabled={!searchInput.trim() || dictionaryLoading}
                    >
                      {dictionaryLoading ? "검색 중..." : "검색"}
                    </button>
                  </div>

                  {dictionaryKeyword && (
                    <div className="article-detail-search-count">
                      사전 검색어: {dictionaryKeyword}
                    </div>
                  )}

                  {dictionaryError && (
                    <p
                      className="article-detail-empty-content"
                      style={{ marginTop: "10px" }}
                    >
                      {dictionaryError}
                    </p>
                  )}

                  {!dictionaryError && dictionaryResults.length > 0 && (
                    <div style={{ marginTop: "14px" }}>
                      <div
                        className="article-detail-source-title"
                        style={{ marginBottom: "10px" }}
                      >
                        사전 결과
                      </div>

                      <div
                        className="article-detail-search-count"
                        style={{ marginBottom: "10px" }}
                      >
                        총 {dictionaryTotal}건 중 {dictionaryResults.length}건 표시
                      </div>

                      {dictionaryResults.map((item) => (
                        <div
                          key={item.key}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            padding: "12px",
                            marginBottom: "10px",
                            background: "#fff",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                            {item.word || "-"}
                            {item.supNo && item.supNo !== "0" ? <sup> {item.supNo}</sup> : null}
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6b7280",
                              marginBottom: "8px",
                            }}
                          >
                            {[item.pos, item.wordGrade, item.pronunciation]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>

                          {item.senses.length > 0 ? (
                            <ol style={{ paddingLeft: "18px", margin: 0 }}>
                              {item.senses.map((sense, index) => (
                                <li key={`${item.key}-sense-${index}`} style={{ marginBottom: "6px" }}>
                                  {sense.definition}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p style={{ margin: 0 }}>뜻풀이 정보가 없습니다.</p>
                          )}

                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-block",
                                marginTop: "10px",
                                fontSize: "14px",
                              }}
                            >
                              사전에서 자세히 보기
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}