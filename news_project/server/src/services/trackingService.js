const axios = require("axios");

const BASE_URL = process.env.TRACKING_BASE_URL || "http://tracking:8002";
const ISSUES_CACHE_TTL_MS = Math.max(
  1000,
  Number(process.env.TRACKING_ISSUES_CACHE_TTL_MS || 30000)
);
const ISSUES_CACHE_MAX_ENTRIES = Math.max(
  10,
  Number(process.env.TRACKING_ISSUES_CACHE_MAX_ENTRIES || 40)
);
const issuesCache = new Map();
const inFlightIssues = new Map();
let warnedFallback = false;

function buildBaseCandidates(rawBase) {
  const candidates = [];
  const seen = new Set();

  const push = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  push(rawBase);

  try {
    const parsed = new URL(rawBase);
    const replaceHost = (hostname, port = parsed.port) => {
      const next = new URL(rawBase);
      next.hostname = hostname;
      if (port) next.port = String(port);
      return next.toString().replace(/\/$/, "");
    };

    if (parsed.hostname === "tracking") {
      push(replaceHost("localhost", parsed.port || "8002"));
      push(replaceHost("127.0.0.1", parsed.port || "8002"));
    }

    if (parsed.hostname === "localhost") {
      push(replaceHost("127.0.0.1", parsed.port || "8002"));
      push(replaceHost("tracking", parsed.port || "8002"));
    }

    if (parsed.hostname === "127.0.0.1") {
      push(replaceHost("localhost", parsed.port || "8002"));
      push(replaceHost("tracking", parsed.port || "8002"));
    }
  } catch (_) {
    // Keep only the original URL if it is not a valid absolute URL.
  }

  return candidates;
}

function buildIssuesCacheKey(params = {}) {
  const normalized = {};

  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];
      if (value === undefined || value === null || value === "") return;
      normalized[key] = String(value);
    });

  return JSON.stringify(normalized);
}

function readIssuesCache(cacheKey) {
  const cached = issuesCache.get(cacheKey);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    issuesCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function writeIssuesCache(cacheKey, data) {
  issuesCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ISSUES_CACHE_TTL_MS,
  });

  while (issuesCache.size > ISSUES_CACHE_MAX_ENTRIES) {
    const oldestKey = issuesCache.keys().next().value;
    if (!oldestKey) break;
    issuesCache.delete(oldestKey);
  }
}

async function requestIssues(params = {}) {
  const bases = buildBaseCandidates(BASE_URL);
  let lastError = null;

  for (const base of bases) {
    try {
      const res = await axios.get(`${base}/issues`, {
        params,
        timeout: 30000,
      });

      if (base !== BASE_URL && !warnedFallback) {
        warnedFallback = true;
        console.warn(`[tracking] fallback base URL used: ${base}`);
      }

      return res.data;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("tracking issues fetch failed");
}

async function getIssues({
  category,
  limit,
  article_id,
  include_related,
  include_article_content,
  refresh_summary,
} = {}) {
  const params = {};
  if (category) params.category = category;
  if (limit) params.limit = limit;
  if (article_id) params.article_id = article_id;
  if (include_related !== undefined) params.include_related = include_related;
  if (include_article_content !== undefined) {
    params.include_article_content = include_article_content;
  }
  if (refresh_summary !== undefined) params.refresh_summary = refresh_summary;

  const cacheKey = buildIssuesCacheKey(params);
  const cached = readIssuesCache(cacheKey);
  if (cached) {
    return cached;
  }

  if (inFlightIssues.has(cacheKey)) {
    return inFlightIssues.get(cacheKey);
  }

  const request = requestIssues(params)
    .then((data) => {
      writeIssuesCache(cacheKey, data);
      return data;
    })
    .finally(() => {
      inFlightIssues.delete(cacheKey);
    });

  inFlightIssues.set(cacheKey, request);
  return request;
}

async function warmIssuesCache(overrides = {}) {
  try {
    await getIssues({
      limit: 12,
      include_related: 1,
      include_article_content: 0,
      refresh_summary: 0,
      ...overrides,
    });
  } catch (error) {
    console.warn("[tracking] warmIssuesCache failed:", error?.message || error);
  }
}

module.exports = { getIssues, warmIssuesCache };
