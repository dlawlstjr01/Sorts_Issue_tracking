import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../CSS/main.css";

import { getNewsById } from "../api/newsApi";
import { fetchGlossary } from "../utils/searchService";
import GlossaryText from "../components/GlossaryText";
import NoticeModal from "../components/NoticeModal";
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
  politics: "M3 8l9-4 9 4v2H3V8zm2 3h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM3 20h18v2H3z",
  economy: "M3 7a2 2 0 0 1 2-2h14a1 1 0 0 1 1 1v2H5a1 1 0 0 0 0 2h16v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h2v-3h-2Z",
  society: "M9 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 0a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15 12ZM4 19a5 5 0 0 1 10 0v1H4Zm10 1v-1a4.5 4.5 0 0 0-1.1-3 4.8 4.8 0 0 1 7.1 4v0Z",
  world: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.8 9h-3.1a15.5 15.5 0 0 0-1.1-5A8 8 0 0 1 19.8 11ZM12 4a13.6 13.6 0 0 1 2.7 7H9.3A13.6 13.6 0 0 1 12 4Zm-3.6 2a15.5 15.5 0 0 0-1.1 5H4.2A8 8 0 0 1 8.4 6ZM4.2 13h3.1a15.5 15.5 0 0 0 1.1 5A8 8 0 0 1 4.2 13ZM12 20a13.6 13.6 0 0 1-2.7-7h5.4A13.6 13.6 0 0 1 12 20Zm3.6-2a15.5 15.5 0 0 0 1.1-5h3.1a8 8 0 0 1-4.2 5Z",
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

const CATEGORY_RULES = {
  politics: ["국회", "대통령", "총리", "정당", "선거", "공천", "탄핵", "외교", "정부", "장관", "의원", "정책", "국정"],
  economy: ["금리", "물가", "환율", "주가", "증시", "코스피", "코스닥", "비트코인", "가상자산", "부동산", "경제", "경기", "실적", "매출", "영업이익", "투자", "수출", "수입", "고용", "실업", "인플레이션"],
  society: ["사건", "사고", "범죄", "경찰", "검찰", "법원", "재판", "구속", "화재", "붕괴", "실종", "폭행", "사망", "노동", "파업", "교육", "학교", "복지", "의료", "질병"],
  world: ["미국", "중국", "일본", "러시아", "우크라이나", "유럽", "EU", "UN", "이스라엘", "가자", "중동", "나토", "해외", "국제", "외신", "정상회담", "관세"],
  it: ["AI", "인공지능", "챗GPT", "오픈AI", "구글", "애플", "메타", "MS", "마이크로소프트", "엔비디아", "반도체", "스마트폰", "보안", "해킹", "클라우드", "데이터", "서버", "알고리즘", "로봇", "과학", "우주"],
  culture: ["영화", "드라마", "OTT", "넷플릭스", "디즈니", "음악", "가수", "아이돌", "공연", "전시", "미술", "문학", "문화", "축제", "패션", "연예", "방송"],
  sports: ["축구", "야구", "농구", "배구", "골프", "테니스", "UFC", "EPL", "K리그", "MLB", "NBA", "KBO", "올림픽", "월드컵", "선수", "감독", "경기", "득점"],
};

const CATEGORY_LABEL_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));
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

const SUMMARY_FALLBACK = "요약 정보가 없습니다.";
const MAIN_PAGE_ISSUE_LIMIT = 24;
const MAIN_PAGE_ISSUE_FETCH_LIMIT = Math.min(MAIN_PAGE_ISSUE_LIMIT * 2, 50);
const RECO_FETCH_LIMIT = 10;
const MAIN_PAGE_STATE_KEY = "mainPageViewState";
const URGENT_TITLE_PREFIX_RE = /^\s*(?:\[[^\]]{0,8}\]\s*)?(?:속보|단독|긴급|특보|1보|2보|3보|breaking)\s*[:\-]?\s*/i;
const ISSUE_TITLE_TOKEN_RE = /[가-힣A-Za-z0-9\u4E00-\u9FFF]+/g;
const URGENT_TITLE_MARKERS = [
  "속보",
  "단독",
  "긴급",
  "특보",
  "체포",
  "구속",
  "기소",
  "사퇴",
  "파면",
  "탄핵",
  "공습",
  "공격",
  "폭발",
  "발사",
  "침공",
  "봉쇄",
  "철수",
  "휴전",
  "종전",
  "사망",
  "실종",
  "화재",
  "지진",
  "홍수",
  "폭우",
  "태풍",
  "산불",
  "참사",
  "해킹",
  "셧다운",
  "폐쇄",
  "중단",
  "급등",
  "급락",
  "폭등",
  "폭락",
];

const CATEGORY_ALIAS_MAP = {
  all: "all",
  전체: "all",
  politics: "politics",
  정치: "politics",
  economy: "economy",
  경제: "economy",
  society: "society",
  사회: "society",
  world: "world",
  국제: "world",
  international: "world",
  it: "it",
  "it/과학": "it",
  과학: "it",
  tech: "it",
  science: "it",
  culture: "culture",
  문화: "culture",
  연예: "culture",
  sports: "sports",
  스포츠: "sports",
};

const safeString = (v) => String(v || "");
const normalizeText = (v) => safeString(v).toLowerCase();
const getArticleKey = (v) => safeString(v).trim();
const ISSUE_DEDUPE_STOPWORDS = new Set([
  "속보",
  "단독",
  "긴급",
  "특보",
  "breaking",
  "기사",
  "기자",
  "보도",
  "종합",
  "1보",
  "2보",
  "3보",
]);

function getTitleUrgencyScore(value) {
  const title = safeString(value).trim();
  if (!title) return 0;

  let score = 0;
  const normalized = normalizeText(title);
  if (URGENT_TITLE_PREFIX_RE.test(title)) score += 6;

  URGENT_TITLE_MARKERS.forEach((marker) => {
    if (normalized.includes(marker.toLowerCase())) score += 2;
  });

  return score;
}

function pickPreferredIssueTitle(primaryTitle = "", candidateTitles = []) {
  const base = safeString(primaryTitle).trim();
  let bestTitle = base;
  let bestScore = getTitleUrgencyScore(base);

  candidateTitles.forEach((candidate, idx) => {
    const title = safeString(candidate).trim();
    if (!title) return;

    const score = getTitleUrgencyScore(title);
    if (!bestTitle || score > bestScore) {
      bestTitle = title;
      bestScore = score;
      return;
    }

    if (score === bestScore && score > 0) {
      const currentLen = safeString(bestTitle).trim().length;
      if (!currentLen || title.length < currentLen || (idx === 0 && title.length === currentLen)) {
        bestTitle = title;
      }
    }
  });

  return bestTitle || "(제목 없음)";
}

function getIssuePrimaryTitle(issue = {}) {
  const representative = getRepresentativeArticle(issue);
  return (
    representative?.title ||
    issue?.title ||
    ""
  );
}

function normalizeIssueTitleForDedupe(value) {
  return safeString(value)
    .replace(URGENT_TITLE_PREFIX_RE, " ")
    .replace(/\s*[-|/]\s*[가-힣A-Za-z0-9\u4E00-\u9FFF .·]{2,20}\s*$/u, " ")
    .replace(/[“”"'`‘’]/g, " ")
    .replace(/[^\u3131-\u318E\uAC00-\uD7A3A-Za-z0-9\u4E00-\u9FFF\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getIssueTitleTokens(value) {
  const matches = normalizeIssueTitleForDedupe(value).match(ISSUE_TITLE_TOKEN_RE) || [];
  return matches.filter((token) => token.length >= 2 && !ISSUE_DEDUPE_STOPWORDS.has(token.toLowerCase()));
}

function getIssueArticleKeySet(issue = {}) {
  const keys = new Set();
  const primaryKey = getArticleKey(issue?.article_id || issue?.articleId || issue?.id || "");
  if (primaryKey) keys.add(primaryKey);

  const related = Array.isArray(issue?.related_articles) ? issue.related_articles : [];
  related.forEach((article) => {
    const key = getArticleKey(article?.article_id || article?.articleId || article?.id || "");
    if (key) keys.add(key);
  });

  return keys;
}

function getIssueSortTime(issue = {}) {
  const related = Array.isArray(issue?.related_articles) ? issue.related_articles : [];
  const candidateTimes = [
    issue?.created_at,
    issue?.published_at,
    issue?.raw?.created_at,
    issue?.raw?.published_at,
    ...related.map((article) => article?.published_at || article?.created_at),
  ]
    .map((value) => new Date(value || 0).getTime())
    .filter((value) => Number.isFinite(value) && value > 0);

  return candidateTimes.length ? Math.max(...candidateTimes) : 0;
}

function getTokenJaccardScore(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (!setA.size || !setB.size) return 0;

  let shared = 0;
  setA.forEach((token) => {
    if (setB.has(token)) shared += 1;
  });

  return shared / new Set([...setA, ...setB]).size;
}

function isDuplicateIssueSummary(current, existing) {
  const currentArticleKeys = getIssueArticleKeySet(current);
  const existingArticleKeys = getIssueArticleKeySet(existing);

  if (currentArticleKeys.size && existingArticleKeys.size) {
    for (const key of currentArticleKeys) {
      if (existingArticleKeys.has(key)) return true;
    }
  }

  const currentCategory = normalizeCategoryKey(current?.category);
  const existingCategory = normalizeCategoryKey(existing?.category);
  if (currentCategory && existingCategory && currentCategory !== existingCategory) {
    return false;
  }

  const currentTitle = normalizeIssueTitleForDedupe(getIssuePrimaryTitle(current));
  const existingTitle = normalizeIssueTitleForDedupe(getIssuePrimaryTitle(existing));
  if (!currentTitle || !existingTitle) return false;

  if (currentTitle === existingTitle) return true;
  if (currentTitle.length >= 16 && existingTitle.length >= 16 && (currentTitle.includes(existingTitle) || existingTitle.includes(currentTitle))) {
    return true;
  }

  const currentTokens = getIssueTitleTokens(currentTitle);
  const existingTokens = getIssueTitleTokens(existingTitle);
  if (!currentTokens.length || !existingTokens.length) return false;

  const currentTokenSet = new Set(currentTokens);
  const existingTokenSet = new Set(existingTokens);
  let sharedTokenCount = 0;
  currentTokenSet.forEach((token) => {
    if (existingTokenSet.has(token)) sharedTokenCount += 1;
  });
  const jaccard = getTokenJaccardScore([...currentTokenSet], [...existingTokenSet]);

  return (
    (sharedTokenCount >= 3 && jaccard >= 0.6) ||
    (sharedTokenCount >= 4 && jaccard >= 0.5)
  );
}

function dedupeIssueSummaries(items = [], limit = MAIN_PAGE_ISSUE_LIMIT) {
  const sorted = [...items].sort((a, b) => getIssueSortTime(b) - getIssueSortTime(a));
  const deduped = [];

  sorted.forEach((item) => {
    if (deduped.some((existing) => isDuplicateIssueSummary(item, existing))) {
      return;
    }
    deduped.push(item);
  });

  return deduped.slice(0, limit);
}

function loadMainPageState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MAIN_PAGE_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("failed to load main page state:", e);
    return null;
  }
}

function saveMainPageState(nextState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MAIN_PAGE_STATE_KEY, JSON.stringify(nextState));
  } catch (e) {
    console.error("failed to save main page state:", e);
  }
}

function normalizeCategoryKey(value) {
  return CATEGORY_ALIAS_MAP[safeString(value).trim().toLowerCase()] || "";
}

function getCategoryLabel(key) {
  return CATEGORY_LABEL_MAP[normalizeCategoryKey(key)] || "기타";
}

function getFallbackThumb(category) {
  return `${THUMB[category || "society"] || THUMB.society}${UQ}`;
}

function splitBulletSummary(value) {
  const raw = safeString(value).replace(/\r\n?/g, "\n").trim();
  if (!raw) return [];
  const hasBullet = /(^|\n|\s)-\s+\S/.test(raw);

  const chunks = raw
    .split(/\n+/)
    .flatMap((chunk) => {
      const line = safeString(chunk).trim();
      if (!line) return [];
      return hasBullet ? line.split(/\s+(?=-\s+)/g) : [line];
    })
    .map((line) => safeString(line).trim())
    .filter(Boolean);

  return hasBullet
    ? chunks.map((line) => line.replace(/^\s*-\s*/, "").trim()).filter(Boolean).map((line) => `- ${line}`)
    : chunks;
}

function inferCategoryFromNews(news = {}) {
  const text = normalizeText(
    [news.title, news.description, news.summary, news.content, news.body, news.press_name]
      .filter(Boolean)
      .join(" ")
  );

  if (!text) return "society";

  let bestKey = "society";
  let bestScore = 0;

  Object.entries(CATEGORY_RULES).forEach(([key, keywords]) => {
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  });

  return bestScore > 0 ? bestKey : "society";
}

function getRepresentativeArticle(issueSummary = {}) {
  const related = Array.isArray(issueSummary.related_articles) ? issueSummary.related_articles : [];
  return (
    related.find(
      (a) =>
        Number(a.is_representative || 0) === 1 ||
        getArticleKey(a.id || a.article_id) === getArticleKey(issueSummary.article_id)
    ) ||
    related[0] ||
    null
  );
}

function getIssueCategory(issueSummary = {}, representative = null) {
  return (
    normalizeCategoryKey(representative?.category) ||
    normalizeCategoryKey(issueSummary?.category) ||
    inferCategoryFromNews({
      title: representative?.title || issueSummary?.title || "",
      summary: issueSummary?.ultra_short || issueSummary?.summary || "",
      description: issueSummary?.short_summary || "",
      content: representative?.content || issueSummary?.background || "",
      body: representative?.body || "",
      press_name: representative?.press_name || "",
    })
  );
}

function mapIssueSummaryToLatestUI(issueSummary = {}) {
  const related = Array.isArray(issueSummary.related_articles) ? issueSummary.related_articles : [];
  const representative = getRepresentativeArticle(issueSummary);
  const category = getIssueCategory(issueSummary, representative) || "society";
  const preferredTitle = pickPreferredIssueTitle(
    representative?.title || issueSummary.title || "",
    related.map((article) => article?.title || "")
  );

  return {
    id: safeString(issueSummary.id ?? issueSummary.article_id ?? ""),
    issueSummaryId: safeString(issueSummary.id ?? ""),
    articleId: safeString(issueSummary.article_id || representative?.id || representative?.article_id || ""),
    category,
    title: preferredTitle || "(이슈 제목 없음)",
    relatedCount: Number(issueSummary.related_count || related.length || 0),
    related_articles: related,
    shortSummary: issueSummary.short_summary || "",
    ultraShort: issueSummary.ultra_short || "",
    createdAt: issueSummary.created_at ? new Date(issueSummary.created_at).getTime() : Date.now(),
    representativeUrl: representative?.url || issueSummary.url || "",
    representativeThumbnail: representative?.thumbnail || "",
    representativeContent: representative?.content || "",
    raw: issueSummary,
  };
}

function mapIssueSummaryToMainArticle(issueSummary = {}) {
  const representative = getRepresentativeArticle(issueSummary);
  const related = Array.isArray(issueSummary.related_articles) ? issueSummary.related_articles : [];
  const category = getIssueCategory(issueSummary, representative) || "society";
  const articleId = safeString(
    issueSummary.article_id || representative?.id || representative?.article_id || issueSummary.id || ""
  );
  const preferredTitle = pickPreferredIssueTitle(
    representative?.title || issueSummary.title || "",
    related.map((relatedArticle) => relatedArticle?.title || "")
  );

  return {
    id: articleId,
    issueSummaryId: safeString(issueSummary.id || ""),
    articleId,
    category,
    badge: `묶음 ${Number(issueSummary.related_count || related.length || 0)}`,
    title: preferredTitle || "(이슈 제목 없음)",
    thumbnailUrl: resolveThumbnailUrl(representative?.thumbnail || "", getFallbackThumb(category)),
    summary: [issueSummary.short_summary || SUMMARY_FALLBACK],
    createdAt: issueSummary.created_at ? new Date(issueSummary.created_at).getTime() : Date.now(),
    raw: {
      ...issueSummary,
      id: articleId,
      article_id: articleId,
      issueSummaryId: safeString(issueSummary.id || ""),
      title: preferredTitle || "(이슈 제목 없음)",
      thumbnail: representative?.thumbnail || "",
      url: representative?.url || issueSummary.url || "",
      content: representative?.content || "",
      category,
    },
  };
}

function mapRelatedArticleToGroupItem(article = {}, fallbackCategory = "society", fallbackId = "") {
  const articleId = safeString(article.article_id ?? article.id ?? fallbackId ?? "");
  const category =
    normalizeCategoryKey(article.category) ||
    inferCategoryFromNews({
      title: article.title || "",
      summary: article.ultra_short || "",
      description: article.short_summary || "",
      content: article.content || "",
    }) ||
    fallbackCategory;

  return {
    id: articleId || safeString(fallbackId),
    articleId,
    category,
    title: article.title || "(제목 없음)",
    thumbnailUrl: resolveThumbnailUrl(article.thumbnail, getFallbackThumb(category)),
    ultraShort: article.ultra_short || "",
    shortSummary: article.short_summary || "",
    url: article.url || "",
    content: article.content || "",
    raw: { ...article, id: articleId },
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

function mapIssueToRelatedRecoItem(issue) {
  if (!issue) return null;
  const articleId = safeString(issue.articleId || issue.raw?.article_id || issue.id || "");
  if (!articleId) return null;

  return {
    id: articleId,
    category: normalizeCategoryKey(issue.category) || "society",
    title: issue.title || "(제목 없음)",
    meta: issue.shortSummary || issue.ultraShort || "관련 이슈",
    raw: {
      ...(issue.raw || {}),
      id: articleId,
      article_id: articleId,
      title: issue.title || issue.raw?.title || "(제목 없음)",
      url: issue.representativeUrl || issue.raw?.url || "",
      thumbnail: issue.representativeThumbnail || issue.raw?.thumbnail || "",
      content: issue.representativeContent || issue.raw?.content || "",
      category: issue.category || issue.raw?.category || "",
      short_summary: issue.shortSummary || issue.raw?.short_summary || "",
      ultra_short: issue.ultraShort || issue.raw?.ultra_short || "",
    },
  };
}

function buildRecoDisplayItem(item) {
  const raw = item?.raw ?? item;
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

  return {
    id: safeString(raw?.id || raw?.articleId || raw?.url || Math.random()),
    title,
    category,
    raw,
  };
}

function Badge({ type }) {
  const isHot = safeString(type).toUpperCase() === "HOT";
  return <span className={`mp-badge ${isHot ? "hot" : "new"}`}>{isHot ? "🔥 HOT" : "🆕 최신"}</span>;
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
    <button type="button" className={`mp-cat-btn ${active ? "active" : ""}`} onClick={onClick}>
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

function RelatedList({ items, fallbackText, onClick, metaType = "관련" }) {
  if (!items.length) return <div style={{ padding: 10, opacity: 0.7 }}>{fallbackText}</div>;

  return items.map((item, idx) => (
    <RelatedItem
      key={item.id || idx}
      title={item.title}
      meta={`${getCategoryLabel(item.category)} · ${metaType}`}
      onClick={() => onClick(item.raw || item)}
    />
  ));
}

function ShareModal({ open, onClose, data, onKakao, onEmail, onCopy }) {
  if (!open) return null;

  return (
    <div className="mp-share-overlay" onClick={onClose}>
      <div className="mp-share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-share-header">
          <h3>공유</h3>
          <button type="button" className="mp-share-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mp-share-actions">
          <button type="button" className="mp-share-icon-btn kakao" onClick={onKakao}>
            <span className="mp-share-icon">톡</span>
            <span>카카오톡</span>
          </button>

          <button type="button" className="mp-share-icon-btn email" onClick={onEmail}>
            <span className="mp-share-icon">✉</span>
            <span>이메일</span>
          </button>
        </div>

        <div className="mp-share-link-box">
          <input type="text" readOnly value={data?.url || ""} className="mp-share-link-input" />
          <button type="button" className="mp-share-copy-btn" onClick={onCopy}>
            복사
          </button>
        </div>
      </div>
    </div>
  );
}

function LatestIssueCard({ issue, onClick, activeArticleId }) {
  const isActive = getArticleKey(activeArticleId) === getArticleKey(issue.articleId || issue.id);

  return (
    <button type="button" className={`mp-latest-card ${isActive ? "active" : ""}`} onClick={() => onClick(issue)}>
      <div className="mp-latest-title">
        <div>{issue.title || "(제목 없음)"}</div>
      </div>
      {issue.ultraShort ? <div className="mp-related-meta">{issue.ultraShort}</div> : null}
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
          <button type="button" className="mp-latest-btn" onClick={() => scrollByAmount(-1)} aria-label="latest left">
            ◀
          </button>
          <button type="button" className="mp-latest-btn" onClick={() => scrollByAmount(1)} aria-label="latest right">
            ▶
          </button>
        </div>
      </div>

      {!items.length ? (
        <div style={{ padding: 12, opacity: 0.7 }}>묶인 기사가 없습니다.</div>
      ) : (
        <div className="mp-latest-track" ref={setTrackEl}>
          {items.map((issue) => (
            <LatestIssueCard
              key={safeString(issue.articleId || issue.id)}
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

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialSavedStateRef = useRef(loadMainPageState());
  const allowPersistRef = useRef(false);
  const restoredRef = useRef(false);
  const centerScrollRef = useRef(null);
  const sectionRefs = useRef({});
  const wheelLockRef = useRef(false);

  const [userId, setUserId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(initialSavedStateRef.current?.selectedCategory || "all");
  const [articleListMode, setArticleListMode] = useState(initialSavedStateRef.current?.articleListMode || "daily");
  const [latestIssues, setLatestIssues] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedId, setSelectedId] = useState(initialSavedStateRef.current?.selectedId || null);
  const [activeIssueArticleId, setActiveIssueArticleId] = useState(initialSavedStateRef.current?.activeIssueArticleId || null);
  const [recoItems, setRecoItems] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoReady, setRecoReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [noticeModal, setNoticeModal] = useState({ open: false, message: "" });
  const [archiveKeys, setArchiveKeys] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [glossaryList, setGlossaryList] = useState([]);

  const displayedArticles = useMemo(() => {
    const filtered =
      selectedCategory === "all"
        ? articles
        : articles.filter((a) => normalizeCategoryKey(a.category) === normalizeCategoryKey(selectedCategory));

    const sorted = [...filtered].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (articleListMode !== "weekly") return sorted;

    const sevenDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const weekly = sorted.filter((a) => (a.createdAt || 0) >= sevenDaysAgo);
    return weekly.length ? weekly : sorted;
  }, [articles, selectedCategory, articleListMode]);

  const latestIssueByArticleId = useMemo(
    () => new Map(latestIssues.map((issue) => [safeString(issue.articleId || issue.id), issue])),
    [latestIssues]
  );

  const issueGroupByArticleId = useMemo(() => {
    const map = new Map();

    latestIssues.forEach((issue) => {
      const rawRelated = Array.isArray(issue.related_articles) ? issue.related_articles : [];
      map.set(
        safeString(issue.articleId || issue.id),
        rawRelated.map((article, idx) => mapRelatedArticleToGroupItem(article, issue.category || "society", idx))
      );
    });

    return map;
  }, [latestIssues]);

  const summaryLinesByArticleId = useMemo(() => {
    const map = new Map();

    latestIssues.forEach((issue) => {
      map.set(safeString(issue.articleId || issue.id), splitBulletSummary(issue.shortSummary || SUMMARY_FALLBACK));
    });

    articles.forEach((article) => {
      const key = safeString(article.id);
      if (!key || map.has(key)) return;
      map.set(key, splitBulletSummary(article.summary?.[0] || SUMMARY_FALLBACK));
    });

    return map;
  }, [latestIssues, articles]);

  const scrollToTop = () => {
    const container = centerScrollRef.current;
    if (!container) return;

    container.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const firstArticle = displayedArticles[0];
    if (firstArticle) {
      const firstId = safeString(firstArticle.id);
      setSelectedId(firstId);
      setActiveIssueArticleId(
        safeString(latestIssueByArticleId.get(firstId)?.articleId || firstId)
      );
    }
  };

  const persistCurrentState = () => {
    if (!allowPersistRef.current) return;
    saveMainPageState({
      selectedCategory,
      articleListMode,
      selectedId,
      activeIssueArticleId,
      centerScrollTop: centerScrollRef.current?.scrollTop || 0,
    });
  };

  useEffect(() => {
    if (!glossaryList.length || !displayedArticles.length) return;

    const firstArticle = displayedArticles[0];
    const articleId = safeString(firstArticle.articleId || firstArticle.id);
    const lines = summaryLinesByArticleId.get(articleId) || [];

  }, [glossaryList, displayedArticles, summaryLinesByArticleId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        setUserId(res.data?.id ?? null);
      } catch (e) {
        if (e?.response?.status !== 401) console.error("[auth/me] failed:", e);
        setUserId(null);
      }
    })();
  }, []);

  useEffect(() => {
    const resetWindowScroll = () => {
      if (typeof window === "undefined") return;
      window.scrollTo(0, 0);
    };

    resetWindowScroll();
    const rafId = requestAnimationFrame(resetWindowScroll);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (!location.state?.resetMainPage) return;

    try {
      sessionStorage.removeItem(MAIN_PAGE_STATE_KEY);
    } catch (e) {
      console.error("failed to clear main page state:", e);
    }

    restoredRef.current = false;
    allowPersistRef.current = false;
    initialSavedStateRef.current = null;

    setSelectedCategory("all");
    setArticleListMode("daily");
    setSelectedId(null);
    setActiveIssueArticleId(null);
    setShareOpen(false);
    setShareTarget(null);
    setNoticeModal({ open: false, message: "" });

    requestAnimationFrame(() => {
      const container = centerScrollRef.current;
      if (container) container.scrollTop = 0;
    });

    navigate("/?view=main", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/tracking/issues", {
          params: { limit: MAIN_PAGE_ISSUE_FETCH_LIMIT, include_article_content: 0 },
        });

        const items = res.data?.items || res.data?.issues || res.data?.data || [];
        const grouped = items.filter((it) => Number(it?.related_count || 0) >= 2);
        const deduped = dedupeIssueSummaries(grouped, MAIN_PAGE_ISSUE_LIMIT);

        setLatestIssues(deduped.map(mapIssueSummaryToLatestUI));
        setArticles(deduped.map(mapIssueSummaryToMainArticle));
      } catch (e) {
        console.error("latest issues load failed:", e);
        setLatestIssues([]);
        setArticles([]);
        setError("이슈를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) {
      setRecoItems([]);
      setRecoLoading(false);
      setRecoReady(false);
      return;
    }

    let mounted = true;
    let timeoutId = null;
    let retryCount = 0;
    const MAX_RETRY = 3;

    const loadReco = async () => {
      try {
        if (!mounted) return;
        setRecoLoading(true);

        const res = await axios.get("/reco", { params: { k: RECO_FETCH_LIMIT, userId } });
        const items = Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];

        if (!mounted) return;
        setRecoItems(items);
        setRecoLoading(false);
        setRecoReady(true);

        if (!items.length && retryCount < MAX_RETRY) {
          retryCount += 1;
          timeoutId = setTimeout(loadReco, 20000);
        }
      } catch (e) {
        console.error("추천 불러오기 실패", e);
        if (!mounted) return;
        setRecoItems([]);
        setRecoLoading(false);
        setRecoReady(true);
      }
    };

    setRecoItems([]);
    setRecoReady(false);
    loadReco();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId]);

  useEffect(() => {
    if (!window.Kakao) return;
    if (!window.Kakao.isInitialized()) window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
  }, []);

  useEffect(() => {
    (async () => {
      if (!userId) {
        setArchiveKeys(new Set());
        return;
      }

      try {
        const res = await axios.get("/issue-archives/my/keys", { withCredentials: true });
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setArchiveKeys(new Set(items.map(String)));
      } catch (e) {
        console.error("[issue-archives/my/keys] failed:", e);
        setArchiveKeys(new Set());
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (loading || !articles.length || restoredRef.current) return;

    const saved = initialSavedStateRef.current;
    const hasSelectedInCurrentList = displayedArticles.some((a) => safeString(a.id) === safeString(saved?.selectedId));
    const nextSelectedId = hasSelectedInCurrentList ? safeString(saved?.selectedId) : safeString(displayedArticles[0]?.id);

    setSelectedId(nextSelectedId || null);

    const matchedIssue = latestIssueByArticleId.get(nextSelectedId);
    const group = issueGroupByArticleId.get(nextSelectedId) || [];
    const hasSavedActive = group.some((item) => safeString(item.articleId || item.id) === safeString(saved?.activeIssueArticleId));

    setActiveIssueArticleId(
      hasSavedActive
        ? safeString(saved?.activeIssueArticleId)
        : safeString(matchedIssue?.articleId || nextSelectedId || "")
    );

    requestAnimationFrame(() => {
      const container = centerScrollRef.current;
      if (!container) return;

      const targetEl = sectionRefs.current[nextSelectedId];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        container.scrollTop = 0;
      }
    });

    restoredRef.current = true;
    allowPersistRef.current = true;
  }, [loading, articles, displayedArticles, latestIssueByArticleId, issueGroupByArticleId]);

  useEffect(() => {
    const container = centerScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 120);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loading, displayedArticles.length]);

  useEffect(() => {
    if (!restoredRef.current) return;
    persistCurrentState();
  }, [selectedCategory, articleListMode, selectedId, activeIssueArticleId]);

  useEffect(() => {
    let cancelled = false;

    const loadGlossary = async () => {
      try {
        const glossary = await fetchGlossary();
        if (cancelled) return;
        setGlossaryList(Array.isArray(glossary) ? glossary : []);
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

  const selectedArticle = useMemo(
    () =>
      displayedArticles.find((a) => safeString(a.id) === safeString(selectedId)) || displayedArticles[0] || null,
    [displayedArticles, selectedId]
  );

  const selectedIssue = useMemo(
    () => (selectedArticle ? latestIssueByArticleId.get(safeString(selectedArticle.id)) || null : null),
    [selectedArticle, latestIssueByArticleId]
  );

  const selectedIssueGroup = useMemo(
    () => (selectedIssue ? issueGroupByArticleId.get(safeString(selectedIssue.articleId || selectedIssue.id)) || [] : []),
    [selectedIssue, issueGroupByArticleId]
  );

  const activeIssueArticle = useMemo(() => {
    if (!selectedIssue) return null;
    const activeId = safeString(activeIssueArticleId || selectedIssue.articleId || selectedIssue.article_id || "");
    return (
      selectedIssueGroup.find((item) => safeString(item.articleId || item.id) === activeId) ||
      selectedIssueGroup[0] ||
      null
    );
  }, [selectedIssue, selectedIssueGroup, activeIssueArticleId]);

  const contrastArticles = useMemo(() => {
    if (!selectedArticle) return [];

    const source = articles.filter((a) => safeString(a.id) !== safeString(selectedArticle.id));
    const selectedCategoryKey = normalizeCategoryKey(selectedArticle.category);
    const opposite = OPPOSITE_CATEGORY_MAP[selectedCategoryKey] || [];
    const allCategories = CATEGORIES.map((c) => c.key).filter((k) => k !== "all");
    const fallback = allCategories.filter((k) => k !== selectedCategoryKey && !opposite.includes(k));

    const primary = source.filter((a) => opposite.includes(normalizeCategoryKey(a.category)));
    const secondary = source.filter((a) => fallback.includes(normalizeCategoryKey(a.category)));
    const tail = source.filter((a) => {
      const key = normalizeCategoryKey(a.category);
      return !opposite.includes(key) && !fallback.includes(key);
    });

    return [...primary, ...secondary, ...tail].slice(0, 6);
  }, [selectedArticle, articles]);

  const relatedRecoItems = useMemo(
    () => latestIssues.map(mapIssueToRelatedRecoItem).filter(Boolean).slice(0, 6),
    [latestIssues]
  );

  const recoDisplayItems = useMemo(() => recoItems.map(buildRecoDisplayItem), [recoItems]);

  const contrastDisplayItems = useMemo(
    () =>
      contrastArticles.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        raw: item.raw || item,
      })),
    [contrastArticles]
  );

  const moveToArticleByStep = (step) => {
    if (!displayedArticles.length) return;

    const currentIndex = displayedArticles.findIndex((a) => safeString(a.id) === safeString(selectedId));
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = Math.max(0, Math.min(displayedArticles.length - 1, safeCurrentIndex + step));
    const nextArticle = displayedArticles[nextIndex];
    if (!nextArticle) return;

    const nextId = safeString(nextArticle.id);
    setSelectedId(nextId);
    setActiveIssueArticleId(safeString(latestIssueByArticleId.get(nextId)?.articleId || nextId));

    const targetEl = sectionRefs.current[nextId];
    if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectIssueInCenter = (article) => {
    const nextId = safeString(article?.id);
    if (!nextId) return;

    setSelectedId(nextId);
    setActiveIssueArticleId(safeString(latestIssueByArticleId.get(nextId)?.articleId || nextId));

    const targetEl = sectionRefs.current[nextId];
    if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCenterWheel = (e) => {
    if (e.target.closest(".mp-summary-scroll") || e.target.closest(".mp-latest-track")) return;

    if (wheelLockRef.current) return;

    const delta = e.deltaY;
    if (Math.abs(delta) < 8) return;

    wheelLockRef.current = true;
    moveToArticleByStep(delta > 0 ? 1 : -1);

    setTimeout(() => {
      wheelLockRef.current = false;
    }, 700);
  };

  const openOriginal = (article) => {
    const source = article?.raw || article;
    const normalized = rememberArticleDetail(source);

    if (!normalized) {
      setNoticeModal({ open: true, message: "기사 정보를 확인할 수 없습니다." });
      return;
    }

    persistCurrentState();

    navigate(`/?view=article&id=${encodeURIComponent(normalized.id)}`, {
      state: {
        article: normalized,
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  const onSaveArticle = async (article) => {
    if (!userId) {
      setNoticeModal({ open: true, message: "로그인 후 저장할 수 있습니다." });
      return;
    }

    const issueSummaryId = article?.issueSummaryId || article?.raw?.issueSummaryId || article?.raw?.id || null;
    if (!issueSummaryId) {
      setNoticeModal({ open: true, message: "저장할 이슈 정보를 찾을 수 없습니다." });
      return;
    }

    const key = safeString(issueSummaryId);

    try {
      if (archiveKeys.has(key)) {
        await axios.delete(`/issue-archives/${issueSummaryId}`, { withCredentials: true });
        setArchiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setNoticeModal({ open: true, message: "저장이 해제되었습니다." });
      } else {
        await axios.post(`/issue-archives/${issueSummaryId}`, {}, { withCredentials: true });
        setArchiveKeys((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
        setNoticeModal({ open: true, message: "저장되었습니다." });
      }
    } catch (e) {
      console.error("[onSaveArticle] failed:", e);
      setNoticeModal({
        open: true,
        message: e?.response?.data?.message || "저장 처리 중 오류가 발생했습니다.",
      });
    }
  };

  const closeShareModal = () => {
    setShareOpen(false);
    setShareTarget(null);
  };

  const buildShareData = (article) => {
    const source = article?.raw || article || {};
    return {
      title: source.title || "기사 공유",
      description: source.short_summary || source.ultra_short || source.summary || "기사를 확인해보세요.",
      url: source.url || window.location.href,
      imageUrl: source.thumbnail || activeIssueArticle?.thumbnailUrl || selectedArticle?.thumbnailUrl || "",
    };
  };

  const openShareModal = (article) => {
    setShareTarget(article?.raw || article);
    setShareOpen(true);
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
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: "기사 보기", link: { mobileWebUrl: url, webUrl: url } }],
    });
  };

  const shareToEmail = () => {
    const { title, description, url } = buildShareData(shareTarget);
    const subject = encodeURIComponent(`[기사 공유] ${title}`);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareData(shareTarget).url);
      alert("링크가 복사되었습니다.");
    } catch (e) {
      console.error(e);
      alert("링크 복사에 실패했습니다.");
    }
  };

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
                {displayedArticles.map((a) => {
                  const matchedIssue = latestIssueByArticleId.get(safeString(a.id)) || null;

                  return (
                    <button
                      key={a.id}
                      type="button"
                      className={`mp-article-item ${safeString(a.id) === safeString(selectedArticle?.id) ? "active" : ""}`}
                      onClick={() => selectIssueInCenter(a)}
                    >
                      <div className="mp-article-item-top">
                        <span className="mp-article-item-cat">{getCategoryLabel(a.category)}</span>
                      </div>
                      <div className="mp-article-item-title">{matchedIssue?.title || a.title}</div>
                    </button>
                  );
                })}
              </div>

              {error ? (
                <div style={{ padding: "0 12px 12px", color: "#ff6b6b", fontSize: 13 }}>{error}</div>
              ) : null}
            </div>
          </div>
        </aside>

        <main className="mp-center">
          {!displayedArticles.length ? (
            <div style={{ padding: 20, opacity: 0.8 }}>{loading ? "불러오는 중..." : "표시할 이슈가 없습니다."}</div>
          ) : (
            <div
              className="mp-center-scroll"
              ref={centerScrollRef}
              onScroll={persistCurrentState}
            >
              {displayedArticles.map((article) => {
                const articleId = safeString(article.articleId || article.id);
                const isSelected = articleId === safeString(selectedId);
                const currentIssue = latestIssueByArticleId.get(articleId) || null;
                const currentIssueGroup = issueGroupByArticleId.get(articleId) || [];
                const currentSummaryLines = summaryLinesByArticleId.get(articleId) || [];
                const currentGlossary = glossaryList;
                const currentThumb = isSelected
                  ? activeIssueArticle?.thumbnailUrl || currentIssueGroup[0]?.thumbnailUrl || article.thumbnailUrl
                  : article.thumbnailUrl;

                const currentTitle = isSelected
                  ? pickPreferredIssueTitle(
                      activeIssueArticle?.title || currentIssue?.title || article.title,
                      currentIssueGroup.map((item) => item?.title || "")
                    )
                  : pickPreferredIssueTitle(
                      currentIssue?.title || article.title,
                      currentIssueGroup.map((item) => item?.title || "")
                    );

                return (
                  <section
                    key={article.id}
                    ref={(el) => {
                      sectionRefs.current[articleId] = el;
                    }}
                    className={`mp-center-inner ${isSelected ? "active" : ""}`}
                    onMouseEnter={() => setSelectedId(articleId)}
                  >
                    <div className="mp-head">
                      <h1 className="mp-title">{currentTitle}</h1>
                      <Badge type={article.badge} />
                    </div>

                    <div className="mp-thumb-wrap">
                      <img
                        className="mp-thumb"
                        src={currentThumb}
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

                          if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) e.stopPropagation();
                        }}
                      >
                        {currentSummaryLines.length ? (
                          currentSummaryLines.map((line, index) => {
                            const isBullet = safeString(line).trim().startsWith("- ");
                            const textValue = isBullet
                              ? safeString(line).replace(/^\s*-\s*/, "").trim()
                              : safeString(line);

                            return (
                              <div key={`${article.id}-summary-${index}`} className="mp-summary-line">
                                {isBullet ? (
                                  <>
                                    <span className="mp-summary-marker">-</span>
                                    <span className="mp-summary-text">
                                      <GlossaryText text={textValue} glossary={currentGlossary} />
                                    </span>
                                  </>
                                ) : (
                                  <span className="mp-summary-text">
                                    <GlossaryText text={textValue} glossary={currentGlossary} />
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="mp-summary-line">{SUMMARY_FALLBACK}</p>
                        )}
                      </div>

                      <div className="mp-actions">
                        <button className="mp-btn primary" type="button" onClick={() => onSaveArticle(article)}>
                          {archiveKeys.has(safeString(article.issueSummaryId)) ? "저장 해제" : "저장"}
                        </button>

                        <button className="mp-btn secondary" type="button" onClick={() => openShareModal(article)}>
                          공유
                        </button>

                        <button className="mp-btn" type="button" onClick={() => openOriginal(article)}>
                          본문 보기
                        </button>
                      </div>
                    </section>

                    <LatestIssuesCarousel
                      items={currentIssueGroup}
                      count={currentIssueGroup.length}
                      activeArticleId={activeIssueArticleId}
                      onItemClick={async (issue) => {
                        const nextId = safeString(issue.articleId || issue.id).trim();
                        if (!nextId) return;

                        setActiveIssueArticleId(nextId);

                        const targetArticle = issue?.raw || issue;
                        const hasEnoughData =
                          targetArticle && (targetArticle.url || targetArticle.content || targetArticle.title);

                        if (!hasEnoughData) {
                          const detail = await fetchArticleDetailById(nextId);
                          if (detail) {
                            openOriginal({ ...targetArticle, ...detail });
                            return;
                          }
                        }

                        persistCurrentState();
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
                <div style={{ padding: 10, opacity: 0.7 }}>로그인하면 개인화 추천(자주 본 뉴스)이 표시됩니다.</div>
              ) : recoLoading && !recoReady ? (
                <div style={{ padding: 10, opacity: 0.7 }}>추천 기사 불러오는 중...</div>
              ) : recoDisplayItems.length > 0 ? (
                <RelatedList
                  items={recoDisplayItems}
                  fallbackText="추천 데이터가 없습니다."
                  onClick={openOriginal}
                  metaType="관련"
                />
              ) : relatedRecoItems.length > 0 ? (
                <RelatedList
                  items={relatedRecoItems}
                  fallbackText="추천 데이터가 없습니다."
                  onClick={openOriginal}
                  metaType="관련"
                />
              ) : (
                <div style={{ padding: 10, opacity: 0.7 }}>추천 데이터가 없습니다.</div>
              )}
            </div>

            <div className="mp-divider" />

            <div className="mp-panel-title">반대 관점 기사</div>
            <div className="mp-related-list">
              <RelatedList
                items={contrastDisplayItems}
                fallbackText="반대 관점 기사가 없습니다."
                onClick={openOriginal}
                metaType="대조"
              />
            </div>
          </div>
        </aside>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={closeShareModal}
        data={shareTarget ? buildShareData(shareTarget) : null}
        onKakao={shareToKakao}
        onEmail={shareToEmail}
        onCopy={copyShareLink}
      />

      <NoticeModal
        open={noticeModal.open}
        message={noticeModal.message}
        onClose={() => setNoticeModal({ open: false, message: "" })}
      />

      {showScrollTop && (
        <div className="mp-floating-scroll">
          <button
            type="button"
            className="als-fab dark"
            aria-label="맨 위로"
            onClick={scrollToTop}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="m12 6 8 8-1.4 1.4L12 8.8l-6.6 6.6L4 14l8-8Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
