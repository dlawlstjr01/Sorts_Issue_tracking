const axios = require("axios");

const BASE_URL = process.env.TRACKING_BASE_URL || "http://tracking:8002";
const TRACKING_CACHE_TTL_MS = Number(process.env.TRACKING_CACHE_TTL_MS || 15000);
let warnedFallback = false;
const issuesCache = new Map();
const inFlightIssues = new Map();

function buildIssuesCacheKey(params) {
  return JSON.stringify({
    category: params.category || "",
    limit: Number(params.limit || 0),
    article_id: Number(params.article_id || 0),
    include_article_content:
      params.include_article_content === undefined
        ? null
        : Number(params.include_article_content),
  });
}

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

async function getIssues({ category, limit, article_id, include_article_content }) {
  const params = {};
  if (category) params.category = category;
  if (limit) params.limit = limit;
  if (article_id) params.article_id = article_id;
  if (include_article_content !== undefined) {
    params.include_article_content = include_article_content;
  }
  const cacheKey = buildIssuesCacheKey(params);
  const now = Date.now();
  const cached = issuesCache.get(cacheKey);
  if (cached && now - cached.at < TRACKING_CACHE_TTL_MS) {
    return cached.data;
  }
  if (inFlightIssues.has(cacheKey)) {
    return inFlightIssues.get(cacheKey);
  }

  const bases = buildBaseCandidates(BASE_URL);
  const requestPromise = (async () => {
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

        issuesCache.set(cacheKey, {
          at: Date.now(),
          data: res.data,
        });
        return res.data;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("tracking issues fetch failed");
  })();

  inFlightIssues.set(cacheKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inFlightIssues.delete(cacheKey);
  }
}

function warmIssuesCache() {
  return getIssues({
    limit: 24,
    include_article_content: 0,
  }).catch((err) => {
    console.warn("[tracking] cache warm failed:", err?.message || err);
    return null;
  });
}

module.exports = { getIssues, warmIssuesCache };
