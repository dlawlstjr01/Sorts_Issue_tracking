import { resolveThumbnailUrl } from "./imageUrl";

const ARTICLE_DETAIL_CACHE_KEY = "tz_article_detail_cache_v1";
const ARTICLE_DETAIL_CACHE_LIMIT = 80;

function toStringSafe(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function resolveArticleId(source) {
  const directId =
    source?.id ??
    source?.article_id ??
    source?.articleId ??
    source?.news_id ??
    source?.newsId;
  if (directId !== null && directId !== undefined && String(directId).trim()) {
    return String(directId).trim();
  }

  const url = toStringSafe(source?.url || source?.link || "").trim();
  if (url) return `url:${url}`;

  const title = toStringSafe(source?.title).trim();
  const time =
    source?.published_at ??
    source?.created_at ??
    source?.updated_at ??
    source?.createdAt ??
    "";
  const composed = `${title}|${time}`.trim();
  if (composed && composed !== "|") return `title:${composed}`;
  return "";
}

function normalizePublishedAt(source) {
  const raw =
    source?.published_at ??
    source?.created_at ??
    source?.updated_at ??
    source?.publishedAt ??
    source?.createdAt ??
    "";
  if (!raw) return "";
  if (typeof raw === "number") {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  return String(raw);
}

function readCacheList() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(ARTICLE_DETAIL_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === "object" && item.id);
  } catch (_) {
    return [];
  }
}

function writeCacheList(items) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ARTICLE_DETAIL_CACHE_KEY, JSON.stringify(items));
  } catch (_) {
    // Ignore storage exceptions.
  }
}

export function toArticleDetailPayload(raw) {
  if (!raw || typeof raw !== "object") return null;

  const merged = {
    ...(raw.raw && typeof raw.raw === "object" ? raw.raw : {}),
    ...raw,
  };

  const id = resolveArticleId(merged);
  if (!id) return null;

  const summaryText = Array.isArray(merged.summary)
    ? merged.summary.filter(Boolean).join("\n")
    : toStringSafe(merged.summary);

  const issueSummaryId = toStringSafe(
    merged.issueSummaryId ??
    merged.issue_summary_id ??
    merged.issueSummary?.id ??
    ""
  ).trim();

  return {
    id,
    title: toStringSafe(merged.title).trim() || "제목 없음",
    content: toStringSafe(merged.content || merged.body).trim(),
    summary: summaryText.trim(),
    description: toStringSafe(merged.description).trim(),
    url: toStringSafe(merged.url || merged.link).trim(),
    thumbnail: resolveThumbnailUrl(
      toStringSafe(merged.thumbnail || merged.thumbnailUrl).trim(),
      ""
    ),
    category: toStringSafe(merged.category).trim(),
    pressName: toStringSafe(
      merged.pressName || merged.press_name || merged.press
    ).trim(),
    publishedAt: normalizePublishedAt(merged),
    issueSummaryId: issueSummaryId || "",
    issue_summary_id: issueSummaryId || "",
    raw: merged,
    cachedAt: Date.now(),
  };
}

export function rememberArticleDetail(rawArticle) {
  const normalized = toArticleDetailPayload(rawArticle);
  if (!normalized) return null;

  const existing = readCacheList().filter((item) => item.id !== normalized.id);
  const next = [normalized, ...existing].slice(0, ARTICLE_DETAIL_CACHE_LIMIT);
  writeCacheList(next);
  return normalized;
}

export function getRememberedArticleDetail(articleId) {
  const key = toStringSafe(articleId).trim();
  if (!key) return null;
  const found = readCacheList().find((item) => item.id === key);
  return found || null;
}