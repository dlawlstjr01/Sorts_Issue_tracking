import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS/main.css";
import axios from "axios";
import { getNewsById } from "../api/newsApi";

import NoticeModal from "../components/NoticeModal";
import { toggleArchiveItem, getArchiveKeySet } from "../utils/archiveStorage";
import { rememberArticleDetail } from "../utils/articleDetail";
import { resolveThumbnailUrl, withImageFallback } from "../utils/imageUrl";

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "politics", label: "정치" },
  { key: "economy", label: "경제" },
  { key: "society", label: "사회" },
  { key: "world", label: "국제" },
  { key: "it", label: "IT/과학" },
  { key: "culture", label: "문화" },
  { key: "sports", label: "스포츠" },
];

const CATEGORY_ICON_PATHS = {
  all: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  politics:
    "M3 8l9-4 9 4v2H3V8zm2 3h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM3 20h18v2H3z",
  economy:
    "M3 7a2 2 0 0 1 2-2h14a1 1 0 0 1 1 1v2H5a1 1 0 0 0 0 2h16v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h2v-3h-2Z",
  society:
    "M9 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 0a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15 12ZM4 19a5 5 0 0 1 10 0v1H4Zm10 1v-1a4.5 4.5 0 0 0-1.1-3 4.8 4.8 0 0 1 7.1 4v0Z",
  world:
    "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.8 9h-3.1a15.5 15.5 0 0 0-1.1-5A8 8 0 0 1 19.8 11ZM12 4a13.6 13.6 0 0 1 2.7 7H9.3A13.6 13.6 0 0 1 12 4Zm-3.6 2a15.5 15.5 0 0 0-1.1 5H4.2A8 8 0 0 1 8.4 6ZM4.2 13h3.1a15.5 15.5 0 0 0 1.1 5A8 8 0 0 1 4.2 13ZM12 20a13.6 13.6 0 0 1-2.7-7h5.4A13.6 13.6 0 0 1 12 20Zm3.6-2a15.5 15.5 0 0 0 1.1-5h3.1a8 8 0 0 1-4.2 5Z",
  it: "M9 9h6v6H9zM3 10h3v2H3v-2zm15 0h3v2h-3v-2zM10 3h2v3h-2V3zm0 15h2v3h-2v-3zM5.5 5.5 7.6 7.6 6.2 9 4.1 6.9l1.4-1.4Zm12.4 12.4-2.1-2.1 1.4-1.4 2.1 2.1-1.4 1.4Zm0-11-2.1 2.1-1.4-1.4 2.1-2.1 1.4 1.4Zm-12.4 12.4 2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4Z",
  culture: "M14 4v10.2A3.5 3.5 0 1 1 12 11V6l8-2v8.2A3.5 3.5 0 1 1 18 9V4.8L14 6Z",
  sports: "M3 9h2v6H3V9Zm16 0h2v6h-2V9ZM6 7h2v10H6V7Zm10 0h2v10h-2V7ZM9 10h6v4H9v-4Z",
};

const OPPOSITE_CATEGORY_MAP = {
  politics: ["it", "culture", "sports"],
  economy: ["culture", "world", "sports"],
  society: ["economy", "it", "sports"],
  world: ["politics", "culture", "sports"],
  it: ["politics", "society", "world"],
  culture: ["economy", "politics", "it"],
  sports: ["politics", "economy", "world"],
};

const UQ = "?auto=format&fit=crop&w=1200&q=80";
const THUMB = {
  it: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
  economy: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
  society: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620",
  world: "https://images.unsplash.com/photo-1502920917128-1aa500764b4c",
  culture: "https://images.unsplash.com/photo-1507924538820-ede94a04019d",
  sports: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
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

function normalizeCategoryKey(value) {
  const v = String(value || "").trim().toLowerCase();

  if (!v) return "";
  if (["all", "전체"].includes(v)) return "all";
  if (["politics", "정치"].includes(v)) return "politics";
  if (["economy", "경제"].includes(v)) return "economy";
  if (["society", "사회"].includes(v)) return "society";
  if (["world", "국제", "international"].includes(v)) return "world";
  if (["it", "it/과학", "과학", "tech", "science"].includes(v)) return "it";
  if (["culture", "문화", "연예"].includes(v)) return "culture";
  if (["sports", "스포츠"].includes(v)) return "sports";

  return "";
}

function inferCategoryFromNews(n) {
  const text = normalizeText(
    [n.title, n.description, n.summary, n.content, n.body, n.press_name]
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
  const normalizedKey = normalizeCategoryKey(key);
  return CATEGORIES.find((c) => c.key === normalizedKey)?.label || "기타";
}

function Badge({ type }) {
  const isHot = String(type).toUpperCase() === "HOT";
  return (
    <span className={`mp-badge ${isHot ? "hot" : "new"}`}>
      {isHot ? "🔥 HOT" : "🆕 최신"}
    </span>
  );
}

function CategoryIcon({ categoryKey }) {
  const path = CATEGORY_ICON_PATHS[categoryKey] || CATEGORY_ICON_PATHS.all;
  return (
    <span className="mp-cat-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d={path} fill="currentColor" />
      </svg>
    </span>
  );
}

function CategoryButton({ label, categoryKey, active, onClick }) {
  return (
    <button
      type="button"
      className={`mp-cat-btn ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <CategoryIcon categoryKey={categoryKey} />
      {label}
    </button>
  );
}

function RelatedItem({ title, meta, onClick }) {
  return (
    <button type="button" className="mp-related-item" onClick={onClick}>
      <div className="mp-related-title">{title}</div>
      <div className="mp-related-meta">{meta}</div>
    </button>
  );
}

function LatestIssueCard({ issue, onClick, activeArticleId }) {
  const isActive =
    String(activeArticleId || "") === String(issue.articleId || issue.id || "");

  return (
    <button
      type="button"
      className={`mp-latest-card ${isActive ? "active" : ""}`}
      onClick={() => onClick(issue)}
    >
      <div className="mp-latest-title">
        <div>{issue.title || "(제목 없음)"}</div>
      </div>
      {issue.ultraShort ? (
        <div className="mp-related-meta">{issue.ultraShort}</div>
      ) : null}
    </button>
  );
}

function LatestIssuesCarousel({ items, count, onItemClick, activeArticleId }) {
  const [trackEl, setTrackEl] = useState(null);

  const scrollByAmount = (dir) => {
    if (!trackEl) return;
    const amount = Math.max(260, Math.floor(trackEl.clientWidth * 0.85));
    trackEl.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="mp-latest">
      <div className="mp-latest-head">
        <div className="mp-section-title">묶인 기사 ({count || 0})</div>
        <div className="mp-latest-ctrl">
          <button
            type="button"
            className="mp-latest-btn"
            onClick={() => scrollByAmount(-1)}
            aria-label="latest left"
          >
            ◀
          </button>
          <button
            type="button"
            className="mp-latest-btn"
            onClick={() => scrollByAmount(1)}
            aria-label="latest right"
          >
            ▶
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 12, opacity: 0.7 }}>묶인 기사가 없습니다.</div>
      ) : (
        <div className="mp-latest-track" ref={setTrackEl}>
          {items.map((issue) => (
            <LatestIssueCard
              key={String(issue.articleId || issue.id)}
              issue={issue}
              activeArticleId={activeArticleId}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function mapIssueSummaryToLatestUI(it) {
  const relatedArticles = Array.isArray(it.related_articles) ? it.related_articles : [];

  const representative =
    relatedArticles.find(
      (a) =>
        Number(a.is_representative || 0) === 1 ||
        String(a.id || a.article_id || "") === String(it.article_id || "")
    ) || relatedArticles[0] || null;

  const inferredCategory =
    normalizeCategoryKey(representative?.category) ||
    normalizeCategoryKey(it.category) ||
    inferCategoryFromNews({
      title: representative?.title || it.title || "",
      summary: it.ultra_short || it.summary || "",
      description: it.short_summary || "",
      content: representative?.content || it.background || "",
      body: representative?.body || "",
      press_name: representative?.press_name || "",
    });

  return {
    id: String(it.id ?? it.article_id ?? ""),
    issueSummaryId: String(it.id ?? ""),
    articleId: String(
      it.article_id || representative?.id || representative?.article_id || ""
    ),
    category: inferredCategory || "society",
    title: representative?.title || it.title || "(이슈 제목 없음)",
    relatedCount: Number(it.related_count || relatedArticles.length || 0),
    related_articles: relatedArticles,
    shortSummary: it.short_summary || "",
    ultraShort: it.ultra_short || "",
    createdAt: it.created_at ? new Date(it.created_at).getTime() : Date.now(),
    representativeUrl: representative?.url || it.url || "",
    representativeThumbnail: representative?.thumbnail || "",
    representativeContent: representative?.content || "",
    raw: it,
  };
}

function mapIssueSummaryToMainArticle(it) {
  const relatedArticles = Array.isArray(it.related_articles) ? it.related_articles : [];
  const representative =
    relatedArticles.find(
      (a) =>
        Number(a.is_representative || 0) === 1 ||
        String(a.id || a.article_id || "") === String(it.article_id || "")
    ) || relatedArticles[0] || null;

  const inferredCategory =
    normalizeCategoryKey(representative?.category) ||
    normalizeCategoryKey(it.category) ||
    inferCategoryFromNews({
      title: representative?.title || it.title || "",
      summary: it.ultra_short || it.summary || "",
      description: it.short_summary || "",
      content: representative?.content || it.background || "",
      body: representative?.body || "",
      press_name: representative?.press_name || "",
    });

  const fallbackThumb = `${THUMB[inferredCategory || "society"] || THUMB.it}${UQ}`;

  return {
    id: String(
      it.article_id || representative?.id || representative?.article_id || it.id || ""
    ),
    issueSummaryId: String(it.id || ""),
    articleId: String(
      it.article_id || representative?.id || representative?.article_id || it.id || ""
    ),
    category: inferredCategory || "society",
    badge: `묶음 ${Number(it.related_count || relatedArticles.length || 0)}`,
    title: representative?.title || it.title || "(이슈 제목 없음)",
    thumbnailUrl: resolveThumbnailUrl(
      representative?.thumbnail || "",
      fallbackThumb
    ),
    summary: [it.short_summary || "요약 정보가 없습니다."],
    createdAt: it.created_at ? new Date(it.created_at).getTime() : Date.now(),
    raw: {
      ...it,
      title: representative?.title || it.title || "(이슈 제목 없음)",
      thumbnail: representative?.thumbnail || "",
      url: representative?.url || it.url || "",
      content: representative?.content || "",
    },
  };
}

function mapTrackingItemToRelatedUI(it) {
  const title = it?.title || it?.issue_title || it?.headline || "(제목 없음)";
  const url = it?.url || it?.representative_url || it?.top_url || "";
  const summary =
    it?.summary || it?.ultra_short || it?.issue_summary || it?.description || "";
  const id = String(it?.id || it?.issue_id || url || title);

  const inferredCategory =
    normalizeCategoryKey(it?.category) ||
    inferCategoryFromNews({
      title: it?.title || "",
      summary: it?.ultra_short || it?.summary || "",
      description: it?.short_summary || it?.description || "",
      content: it?.content || it?.background || "",
      body: it?.body || "",
      press_name: it?.press_name || "",
    });

  return {
    id,
    category: inferredCategory || "society",
    title,
    meta: summary,
    raw: { ...it, url },
  };
}

async function fetchArticleDetailById(articleId) {
  if (!articleId) return null;

  try {
    const res = await getNewsById(articleId);
    const data = res?.data;

    return (
      data?.item ||
      data?.data ||
      data?.article ||
      (Array.isArray(data?.items) ? data.items[0] : null) ||
      (Array.isArray(data) ? data[0] : data)
    );
  } catch (e) {
    console.error("fetchArticleDetailById failed:", e);
    return null;
  }
}

function mapArticleDetailToView(article, fallbackCategory = "society") {
  if (!article) return null;

  const rawId = article.id ?? article.article_id ?? article.news_id;
  const id = String(rawId ?? "");

  const category =
    normalizeCategoryKey(article.category) ||
    inferCategoryFromNews({
      title: article.title,
      summary: article.summary || article.short_summary || article.ultra_short,
      description: article.description,
      content: article.content,
      body: article.body,
    }) ||
    fallbackCategory;

  const fallbackThumb = `${THUMB[category] || THUMB.it}${UQ}`;

  return {
    id,
    articleId: id,
    category,
    badge: "이슈",
    title: article.title || "(제목 없음)",
    thumbnailUrl: resolveThumbnailUrl(article.thumbnail, fallbackThumb),
    summary: [
      article.short_summary ||
      article.ultra_short ||
      article.summary ||
      "요약 정보가 없습니다. 본문 보기로 원문을 확인하세요.",
    ],
    createdAt: article.published_at
      ? new Date(article.published_at).getTime()
      : Date.now(),
    raw: article,
  };
}

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articleListMode, setArticleListMode] = useState("daily");

  const [latestIssues, setLatestIssues] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [activeIssueArticleId, setActiveIssueArticleId] = useState(null);
  const [issueArticleDetails, setIssueArticleDetails] = useState({});

  const [recoItems, setRecoItems] = useState([]);
  const [trackRelated, setTrackRelated] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoReady, setRecoReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shareOpen, setShareOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [noticeModal, setNoticeModal] = useState({ open: false, message: "" });
  const [archiveKeys, setArchiveKeys] = useState(() => getArchiveKeySet());

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
    const loadLatestIssues = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/tracking/issues", {
          params: { limit: 50 },
        });

        const items = res.data?.items || res.data?.issues || res.data?.data || [];

        const onlyGrouped = items.filter((it) => Number(it?.related_count || 0) >= 2);

        const mappedIssues = onlyGrouped.map((it) => mapIssueSummaryToLatestUI(it));
        const mappedArticles = onlyGrouped.map((it) => mapIssueSummaryToMainArticle(it));

        setLatestIssues(mappedIssues);
        setArticles(mappedArticles);

        const firstId = String(mappedArticles[0]?.id || "");
        setSelectedId(firstId || null);
      } catch (e) {
        console.error("latest issues load failed:", e);
        setLatestIssues([]);
        setArticles([]);
        setError("이슈를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadLatestIssues();
  }, []);

  useEffect(() => {
    if (!userId) {
      setRecoItems([]);
      setRecoLoading(false);
      setRecoReady(false);
      return;
    }

    let isMounted = true;
    let timeoutId = null;
    let retryCount = 0;
    const MAX_RETRY = 3;

    const loadReco = async () => {
      try {
        if (!isMounted) return;
        setRecoLoading(true);

        const res = await axios.get("/reco", {
          params: { k: 20, userId },
        });

        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
            ? res.data
            : [];

        if (!isMounted) return;

        setRecoItems(items);
        setRecoLoading(false);
        setRecoReady(true);

        if (!items.length && retryCount < MAX_RETRY) {
          retryCount += 1;
          timeoutId = setTimeout(loadReco, 20000);
        }
      } catch (err) {
        console.error("추천 불러오기 실패", err);
        if (!isMounted) return;
        setRecoItems([]);
        setRecoLoading(false);
        setRecoReady(true);
      }
    };

    setRecoItems([]);
    setRecoReady(false);
    loadReco();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId]);

  useEffect(() => {
    const loadTrackingRelated = async () => {
      try {
        const res = await axios.get("/tracking/issues", {
          params: { limit: 6 },
        });

        const items = res.data?.items || res.data?.issues || res.data?.data || [];
        const mapped = items.map(mapTrackingItemToRelatedUI);
        setTrackRelated(mapped);
      } catch (e) {
        console.error("tracking related load failed:", e);
        setTrackRelated([]);
      }
    };

    loadTrackingRelated();
  }, []);

  const displayedArticles = useMemo(() => {
    const source =
      selectedCategory === "all"
        ? articles
        : articles.filter(
          (a) =>
            normalizeCategoryKey(a.category) ===
            normalizeCategoryKey(selectedCategory)
        );

    const sorted = [...source].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (articleListMode === "weekly") {
      const sevenDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
      const weekly = sorted.filter((a) => (a.createdAt || 0) >= sevenDaysAgo);
      return weekly.length ? weekly : sorted;
    }

    return sorted;
  }, [articles, selectedCategory, articleListMode]);

  useEffect(() => {
    if (!displayedArticles.length) {
      setSelectedId(null);
      return;
    }

    const exists = displayedArticles.some(
      (a) => String(a.id) === String(selectedId)
    );

    if (!exists) {
      setSelectedId(String(displayedArticles[0].id));
    }
  }, [displayedArticles, selectedId]);

  const selectedArticle = useMemo(() => {
    if (!displayedArticles.length) return null;
    return (
      displayedArticles.find((a) => String(a.id) === String(selectedId)) ||
      displayedArticles[0]
    );
  }, [displayedArticles, selectedId]);

  const selectedIssue = useMemo(() => {
    if (!selectedArticle) return null;

    return (
      latestIssues.find(
        (it) => String(it.articleId) === String(selectedArticle.id)
      ) || null
    );
  }, [selectedArticle, latestIssues]);

  useEffect(() => {
    if (!selectedIssue) {
      setActiveIssueArticleId(null);
      return;
    }
    setActiveIssueArticleId(String(selectedIssue.articleId || ""));
  }, [selectedIssue]);

  const selectedIssueGroup = useMemo(() => {
    if (!selectedIssue) return [];

    const rawRelated = Array.isArray(selectedIssue.related_articles)
      ? selectedIssue.related_articles
      : [];

    return rawRelated.map((article, idx) => {
      const articleId = String(article.article_id ?? article.id ?? "");
      const category =
        normalizeCategoryKey(article.category) ||
        inferCategoryFromNews({
          title: article.title,
          summary: article.ultra_short || "",
          description: article.short_summary || "",
          content: article.content || "",
        }) ||
        selectedIssue.category ||
        "society";

      const fallbackThumb = `${THUMB[category] || THUMB.it}${UQ}`;

      return {
        id: articleId || String(idx),
        articleId,
        category,
        title: article.title || "(제목 없음)",
        thumbnailUrl: resolveThumbnailUrl(article.thumbnail, fallbackThumb),
        ultraShort: article.ultra_short || "",
        shortSummary: article.short_summary || "",
        url: article.url || "",
        content: article.content || "",
        raw: {
          ...article,
          id: articleId,
        },
      };
    });
  }, [selectedIssue]);

  useEffect(() => {
    const loadIssueArticleDetails = async () => {
      if (!selectedIssue || !selectedIssueGroup.length) return;

      const targetIds = selectedIssueGroup
        .map((item) => String(item.articleId || item.id || "").trim())
        .filter(Boolean);

      const missingIds = targetIds.filter((id) => {
        const fromGroup = selectedIssueGroup.find(
          (item) => String(item.articleId || item.id || "") === String(id)
        );
        const hasContentInGroup = Boolean(fromGroup?.content || fromGroup?.raw?.content);
        const hasFetchedDetail = Boolean(issueArticleDetails[id]?.raw?.content);
        return !hasContentInGroup && !hasFetchedDetail;
      });

      if (!missingIds.length) return;

      const loadedEntries = await Promise.all(
        missingIds.map(async (id) => {
          const detail = await fetchArticleDetailById(id);
          if (!detail) return null;
          return [id, mapArticleDetailToView(detail, selectedIssue.category || "society")];
        })
      );

      const nextEntries = loadedEntries.filter(Boolean);
      if (!nextEntries.length) return;

      setIssueArticleDetails((prev) => ({
        ...prev,
        ...Object.fromEntries(nextEntries),
      }));
    };

    loadIssueArticleDetails();
  }, [selectedIssue, selectedIssueGroup, issueArticleDetails]);

  const activeIssueArticle = useMemo(() => {
    if (!selectedIssue) return null;

    const activeId = String(
      activeIssueArticleId || selectedIssue.articleId || selectedIssue.article_id || ""
    );

    const fromGroup =
      selectedIssueGroup.find(
        (item) => String(item.articleId || item.id || "") === activeId
      ) || null;

    const fromFetched = issueArticleDetails[activeId] || null;

    if (fromGroup && fromFetched) {
      return {
        ...fromGroup,
        ...fromFetched,
        title: fromFetched.title || fromGroup.title,
        thumbnailUrl: fromFetched.thumbnailUrl || fromGroup.thumbnailUrl,
        category: fromFetched.category || fromGroup.category,
        raw: {
          ...(fromGroup.raw || {}),
          ...(fromFetched.raw || {}),
        },
      };
    }

    if (fromFetched) return fromFetched;
    if (fromGroup) return fromGroup;

    return null;
  }, [selectedIssue, selectedIssueGroup, activeIssueArticleId, issueArticleDetails]);

  const contrastArticles = useMemo(() => {
    if (!selectedArticle) return [];

    const source = articles.filter((a) => String(a.id) !== String(selectedArticle.id));
    const selectedCategoryKey = normalizeCategoryKey(selectedArticle.category);
    const oppositeCategories = OPPOSITE_CATEGORY_MAP[selectedCategoryKey] || [];
    const allCategories = CATEGORIES.map((c) => c.key).filter((k) => k !== "all");
    const fallbackCategories = allCategories.filter(
      (k) => k !== selectedCategoryKey && !oppositeCategories.includes(k)
    );

    const primary = source.filter((a) =>
      oppositeCategories.includes(normalizeCategoryKey(a.category))
    );
    const secondary = source.filter((a) =>
      fallbackCategories.includes(normalizeCategoryKey(a.category))
    );
    const tail = source.filter((a) => {
      const key = normalizeCategoryKey(a.category);
      return !oppositeCategories.includes(key) && !fallbackCategories.includes(key);
    });

    return [...primary, ...secondary, ...tail].slice(0, 6);
  }, [selectedArticle, articles]);

  const relatedRecoItems = trackRelated;
  const contrastRecoItems = [];

  const openOriginal = (article) => {
    const source = article?.raw || article;
    const normalized = rememberArticleDetail(source);

    if (!normalized) {
      setNoticeModal({ open: true, message: "기사 정보를 확인할 수 없습니다." });
      return;
    }

    navigate(`/?view=article&id=${encodeURIComponent(normalized.id)}`, {
      state: {
        article: normalized,
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  useEffect(() => {
    if (!window.Kakao) return;
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }
  }, []);

  const onSaveArticle = (article) => {
    const source = article?.raw || article;
    const next = toggleArchiveItem(source);
    setArchiveKeys(getArchiveKeySet());
    setNoticeModal({
      open: true,
      message: next ? "저장되었습니다." : "저장이 해제되었습니다.",
    });
  };

  const openShareModal = (article) => {
    const target = article?.raw || article;
    setShareTarget(target);
    setShareOpen(true);
  };

  const closeShareModal = () => {
    setShareOpen(false);
    setShareTarget(null);
  };

  const buildShareData = (article) => {
    const source = article?.raw || article || {};
    const title = source.title || "기사 공유";
    const description =
      source.short_summary ||
      source.ultra_short ||
      source.summary ||
      "기사를 확인해보세요.";
    const url = source.url || window.location.href;
    const imageUrl =
      source.thumbnail ||
      activeIssueArticle?.thumbnailUrl ||
      selectedArticle?.thumbnailUrl ||
      "";

    return { title, description, url, imageUrl };
  };

  const shareToKakao = () => {
    const { title, description, url, imageUrl } = buildShareData(shareTarget);

    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오 공유 설정이 아직 완료되지 않았습니다.");
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: "기사 보기",
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
  };

  const shareToEmail = () => {
    const { title, description, url } = buildShareData(shareTarget);
    const subject = encodeURIComponent(`[기사 공유] ${title}`);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyShareLink = async () => {
    const { url } = buildShareData(shareTarget);

    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다.");
    } catch (e) {
      console.error(e);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const currentCenterArticle = activeIssueArticle || selectedArticle;
  const currentCenterTitle =
    activeIssueArticle?.title || selectedIssue?.title || selectedArticle?.title || "";

  const currentCenterSummary =
    selectedIssue?.shortSummary ||
    selectedArticle?.summary?.[0] ||
    "요약 정보가 없습니다. 본문 보기로 원문을 확인하세요.";

  const currentCenterThumb =
    activeIssueArticle?.thumbnailUrl || selectedArticle?.thumbnailUrl || "";

  const isSaved = useMemo(() => {
    if (!currentCenterArticle) return false;
    const source = currentCenterArticle?.raw || currentCenterArticle;
    const key =
      String(
        source?.id ??
        source?.article_id ??
        source?.news_id ??
        source?.url ??
        source?.title ??
        ""
      ).trim();
    return archiveKeys.has(key);
  }, [currentCenterArticle, archiveKeys]);

  return (
    <div className="mp-wrap">
      <div className="mp-grid">
        <aside className="mp-left">
          <div className="mp-panel">
            <div className="mp-panel-title">카테고리</div>

            <div className="mp-cat-list">
              {CATEGORIES.map((c) => (
                <CategoryButton
                  key={c.key}
                  label={c.label}
                  categoryKey={c.key}
                  active={selectedCategory === c.key}
                  onClick={() => {
                    setSelectedCategory(c.key);
                    setSelectedId(null);
                    setActiveIssueArticleId(null);
                  }}
                />
              ))}
            </div>

            <div className="mp-divider" />

            <div className="mp-article-shell">
              <div className="mp-article-head">
                <div className="mp-article-tabs" role="tablist" aria-label="기사 목록 모드">
                  <button
                    type="button"
                    className={`mp-article-tab ${articleListMode === "daily" ? "active" : ""}`}
                    onClick={() => setArticleListMode("daily")}
                    aria-pressed={articleListMode === "daily"}
                  >
                    일간
                  </button>
                  <button
                    type="button"
                    className={`mp-article-tab ${articleListMode === "weekly" ? "active" : ""}`}
                    onClick={() => setArticleListMode("weekly")}
                    aria-pressed={articleListMode === "weekly"}
                  >
                    주간
                  </button>
                </div>
              </div>

              <div className="mp-article-list">
                {displayedArticles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`mp-article-item ${String(a.id) === String(selectedArticle?.id) ? "active" : ""}`}
                    onClick={() => {
                      openOriginal(a);
                    }}
                  >
                    <div className="mp-article-item-top">
                      <span className="mp-article-item-cat">{getCategoryLabel(a.category)}</span>
                    </div>
                    <div className="mp-article-item-title">{a.title}</div>
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ padding: "0 12px 12px", color: "#ff6b6b", fontSize: 13 }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="mp-center">
          {!displayedArticles.length ? (
            <div style={{ padding: 20, opacity: 0.8 }}>
              {loading ? "불러오는 중..." : "표시할 이슈가 없습니다."}
            </div>
          ) : (
            <div className="mp-center-scroll">
              {displayedArticles.map((article) => {
                const isSelected = String(article.id) === String(selectedId);

                const currentIssue =
                  latestIssues.find(
                    (it) => String(it.articleId) === String(article.id)
                  ) || null;

                const currentIssueGroup = Array.isArray(currentIssue?.related_articles)
                  ? currentIssue.related_articles.map((item, idx) => {
                    const articleId = String(item.article_id ?? item.id ?? "");

                    const category =
                      normalizeCategoryKey(item.category) ||
                      inferCategoryFromNews({
                        title: item.title || "",
                        summary: item.ultra_short || "",
                        description: item.short_summary || "",
                        content: item.content || "",
                      }) ||
                      currentIssue?.category ||
                      "society";

                    const fallbackThumb = `${THUMB[category] || THUMB.it}${UQ}`;

                    return {
                      id: articleId || String(idx),
                      articleId,
                      category,
                      title: item.title || "(제목 없음)",
                      thumbnailUrl: resolveThumbnailUrl(item.thumbnail, fallbackThumb),
                      ultraShort: item.ultra_short || "",
                      shortSummary: item.short_summary || "",
                      url: item.url || "",
                      content: item.content || "",
                      raw: {
                        ...item,
                        id: articleId,
                      },
                    };
                  })
                  : [];

                return (
                  <section
                    key={article.id}
                    className={`mp-center-inner ${isSelected ? "active" : ""}`}
                    onMouseEnter={() => setSelectedId(String(article.id))}
                  >
                    <div className="mp-head">
                      <h1 className="mp-title">
                        {currentIssue?.title || article.title}
                      </h1>
                      <Badge type={article.badge} />
                    </div>

                    <div className="mp-thumb-wrap">
                      <img
                        className="mp-thumb"
                        src={article.thumbnailUrl}
                        alt="article thumbnail"
                        loading="lazy"
                        onError={withImageFallback}
                      />
                      <div className="mp-thumb-label">기사 썸네일</div>
                    </div>

                    <section className="mp-summary">
                      <div className="mp-section-title">요약</div>

                      <div
                        className="mp-summary-lines mp-summary-scroll"
                        onWheel={(e) => {
                          const el = e.currentTarget;
                          const { scrollTop, scrollHeight, clientHeight } = el;
                          const delta = e.deltaY;
                          const atTop = scrollTop <= 0;
                          const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

                          if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) {
                            e.stopPropagation();
                          }
                        }}
                      >
                        <p className="mp-summary-line">
                          {currentIssue?.shortSummary || article.summary?.[0] || "요약 정보가 없습니다."}
                        </p>
                      </div>

                      <div className="mp-actions">
                        <button
                          className="mp-btn primary"
                          type="button"
                          onClick={() => onSaveArticle(article)}
                        >
                          저장
                        </button>

                        <button
                          className="mp-btn primary"
                          type="button"
                          onClick={() => openShareModal(article)}
                        >
                          공유
                        </button>

                        <button
                          className="mp-btn"
                          type="button"
                          onClick={() => openOriginal(article)}
                        >
                          본문 보기
                        </button>
                      </div>

                      {shareOpen && (
                        <div className="mp-share-overlay" onClick={closeShareModal}>
                          <div
                            className="mp-share-modal"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="mp-share-header">
                              <h3>공유</h3>
                              <button
                                type="button"
                                className="mp-share-close"
                                onClick={closeShareModal}
                              >
                                ×
                              </button>
                            </div>

                            <div className="mp-share-actions">
                              <button
                                type="button"
                                className="mp-share-icon-btn kakao"
                                onClick={shareToKakao}
                              >
                                <span className="mp-share-icon">톡</span>
                                <span>카카오톡</span>
                              </button>

                              <button
                                type="button"
                                className="mp-share-icon-btn email"
                                onClick={shareToEmail}
                              >
                                <span className="mp-share-icon">✉</span>
                                <span>이메일</span>
                              </button>
                            </div>

                            <div className="mp-share-link-box">
                              <input
                                type="text"
                                readOnly
                                value={shareTarget ? buildShareData(shareTarget).url : ""}
                                className="mp-share-link-input"
                              />
                              <button
                                type="button"
                                className="mp-share-copy-btn"
                                onClick={copyShareLink}
                              >
                                복사
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <LatestIssuesCarousel
                      items={currentIssueGroup}
                      count={currentIssueGroup.length}
                      activeArticleId={null}
                      onItemClick={async (issue) => {
                        const nextId = String(issue.articleId || issue.id || "").trim();
                        if (!nextId) return;

                        let targetArticle = issue?.raw || issue;
                        const hasEnoughData =
                          targetArticle &&
                          (targetArticle.url || targetArticle.content || targetArticle.title);

                        if (!hasEnoughData) {
                          const detail = await fetchArticleDetailById(nextId);
                          if (detail) targetArticle = detail;
                        }

                        openOriginal(targetArticle);
                      }}
                    />
                  </section>
                );
              })}
            </div>
          )}
        </main>

        <aside className="mp-right">
          <div className="mp-panel">
            <div className="mp-panel-title">추천 기사</div>
            <div className="mp-related-list">
              {!userId ? (
                <div style={{ padding: 10, opacity: 0.7 }}>
                  로그인하면 개인화 추천(자주 본 뉴스)이 표시됩니다.
                </div>
              ) : recoLoading && !recoReady ? (
                <div style={{ padding: 10, opacity: 0.7 }}>
                  추천 기사 불러오는 중...
                </div>
              ) : recoItems.length > 0 ? (
                recoItems.map((a, idx) => {
                  const raw = a?.raw ?? a;
                  const title = raw?.title || raw?.headline || "(제목 없음)";
                  const category =
                    normalizeCategoryKey(raw?.category) ||
                    inferCategoryFromNews({
                      title,
                      summary: raw?.summary || raw?.short_summary || raw?.ultra_short || "",
                      description: raw?.description || "",
                      content: raw?.content || raw?.background || "",
                      body: raw?.body || "",
                      press_name: raw?.press_name || "",
                    });

                  return (
                    <RelatedItem
                      key={String(raw?.id || raw?.articleId || raw?.url || idx)}
                      title={title}
                      meta={`${getCategoryLabel(category)} · 관련`}
                      onClick={() => openOriginal(raw)}
                    />
                  );
                })
              ) : relatedRecoItems.length > 0 ? (
                relatedRecoItems.map((a) => (
                  <RelatedItem
                    key={a.id}
                    title={a.title}
                    meta={`${getCategoryLabel(a.category)} · 관련`}
                    onClick={() => openOriginal(a)}
                  />
                ))
              ) : (
                <div style={{ padding: 10, opacity: 0.7 }}>
                  추천 데이터가 없습니다.
                </div>
              )}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">반대 관점 기사</div>
            <div className="mp-related-list">
              {(contrastRecoItems.length ? contrastRecoItems : contrastArticles).map((a) => (
                <RelatedItem
                  key={`contrast-${a.id}`}
                  title={a.title}
                  meta={`${getCategoryLabel(a.category)} · 대조`}
                  onClick={() => openOriginal(a)}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <NoticeModal
        open={noticeModal.open}
        message={noticeModal.message}
        onClose={() => setNoticeModal({ open: false, message: "" })}
      />
    </div>
  );
}