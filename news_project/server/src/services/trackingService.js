const axios = require("axios");

const RAW_BASE_URL = process.env.TRACKING_BASE_URL || "http://tracking:8002";
const BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, "");

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
    if (!url) return;
    const normalized = String(url).replace(/\/+$/, "");
    if (seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push(normalized);
  };

  push(rawBase);

  try {
    const parsed = new URL(rawBase);

    const replaceHost = (hostname, port = parsed.port) => {
      const next = new URL(rawBase);
      next.hostname = hostname;
      if (port) next.port = String(port);
      return next.toString().replace(/\/+$/, "");
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
  } catch (error) {
    console.warn("[tracking] invalid TRACKING_BASE_URL:", rawBase);
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

function normalizeIssuesResponse(data) {
  if (Array.isArray(data)) {
    return {
      items: data,
      issues: data,
      data,
    };
  }

  if (data && typeof data === "object") {
    const items = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.issues)
      ? data.issues
      : Array.isArray(data.data)
      ? data.data
      : [];

    return {
      ...data,
      items,
      issues: Array.isArray(data.issues) ? data.issues : items,
      data: Array.isArray(data.data) ? data.data : items,
    };
  }

  return {
    items: [],
    issues: [],
    data: [],
  };
}

function buildAxiosErrorMessage(err, base) {
  const status = err?.response?.status;
  const statusText = err?.response?.statusText;
  const responseData = err?.response?.data;
  const code = err?.code;
  const message = err?.message;

  return {
    base,
    status: status || null,
    statusText: statusText || "",
    code: code || "",
    message: message || "unknown axios error",
    responseData: responseData || null,
  };
}

async function requestIssues(params = {}) {
  const bases = buildBaseCandidates(BASE_URL);
  const errors = [];

  for (const base of bases) {
    const requestUrl = `${base}/issues`;

    try {
      console.log("[tracking] request start:", {
        url: requestUrl,
        params,
      });

      const res = await axios.get(requestUrl, {
        params,
        timeout: 30000,
      });

      console.log("[tracking] request success:", {
        url: requestUrl,
        status: res.status,
        itemCount:
          (Array.isArray(res.data?.items) && res.data.items.length) ||
          (Array.isArray(res.data?.issues) && res.data.issues.length) ||
          (Array.isArray(res.data?.data) && res.data.data.length) ||
          (Array.isArray(res.data) && res.data.length) ||
          0,
      });

      if (base !== BASE_URL && !warnedFallback) {
        warnedFallback = true;
        console.warn(`[tracking] fallback base URL used: ${base}`);
      }

      return normalizeIssuesResponse(res.data);
    } catch (err) {
      const errorInfo = buildAxiosErrorMessage(err, base);
      errors.push(errorInfo);

      console.error("[tracking] request failed:", {
        url: requestUrl,
        params,
        ...errorInfo,
      });
    }
  }

  const finalError = new Error("tracking issues fetch failed");
  finalError.details = errors;
  throw finalError;
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

  if (category !== undefined && category !== null && category !== "") {
    params.category = category;
  }

  if (limit !== undefined && limit !== null && limit !== "") {
    params.limit = Number(limit);
  }

  if (article_id !== undefined && article_id !== null && article_id !== "") {
    params.article_id = article_id;
  }

  if (include_related !== undefined) {
    params.include_related = Number(include_related);
  }

  if (include_article_content !== undefined) {
    params.include_article_content = Number(include_article_content);
  }

  if (refresh_summary !== undefined) {
    params.refresh_summary = Number(refresh_summary);
  }

  const cacheKey = buildIssuesCacheKey(params);
  const cached = readIssuesCache(cacheKey);
  if (cached) {
    console.log("[tracking] cache hit:", { params });
    return cached;
  }

  if (inFlightIssues.has(cacheKey)) {
    console.log("[tracking] in-flight reuse:", { params });
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
    console.warn("[tracking] warmIssuesCache failed:", {
      message: error?.message || "unknown error",
      details: error?.details || null,
    });
  }
}

module.exports = { getIssues, warmIssuesCache };