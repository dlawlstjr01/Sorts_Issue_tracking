const axios = require("axios");

const BASE_URL = process.env.TRACKING_BASE_URL || "http://tracking:8002";
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

async function getIssues({ category, limit, article_id }) {
  const params = {};
  if (category) params.category = category;
  if (limit) params.limit = limit;
  if (article_id) params.article_id = article_id;

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

module.exports = { getIssues };
