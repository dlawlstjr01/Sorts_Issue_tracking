const axios = require("axios");
const db = require("../config/DB");

// 크롤링 대상(예: 파이썬이 만든 수집 API가 있으면 그걸 호출해도 됨)
const SOURCE_URL = process.env.CRAWL_SOURCE_URL; 
// 15분
const INTERVAL_MS = Number(process.env.CRAWL_INTERVAL_MS || 15 * 60 * 1000);

function normalizePublishedAt(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 19).replace("T", " ");
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Already in MySQL DATETIME format.
    if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(trimmed)) {
      return trimmed.length === 10 ? `${trimmed} 00:00:00` : trimmed;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 19).replace("T", " ");
    }
    return null;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 19).replace("T", " ");
  }

  return null;
}

function buildSourceUrlCandidates(rawUrl) {
  const candidates = [];
  const seen = new Set();
  const push = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  push(rawUrl);

  try {
    const parsed = new URL(rawUrl);
    const replaceHost = (hostname, port = parsed.port) => {
      const next = new URL(rawUrl);
      next.hostname = hostname;
      if (port) next.port = String(port);
      return next.toString();
    };

    // In docker-compose, crawler API is usually crawler:8001.
    if (parsed.hostname === "python" && parsed.port === "8001") {
      push(replaceHost("crawler", "8001"));
    }

    // In local dev, docker DNS names do not resolve on host OS.
    if (parsed.hostname === "python" || parsed.hostname === "crawler") {
      push(replaceHost("localhost", parsed.port));
    }

    // Some environments resolve 127.0.0.1 more reliably than localhost.
    if (parsed.hostname === "localhost") {
      push(replaceHost("127.0.0.1", parsed.port));
    }
  } catch (_) {
    // Keep the original URL only if parsing fails.
  }

  return candidates;
}

/**
 * 크롤링 결과를 아래 형태로 맞춰서 반환하면 됩니다.
 * [
 *   { url, title, thumbnail, category, content, published_at }
 * ]
 */
async function fetchArticlesFromSource() {
  if (!SOURCE_URL) {
    console.warn("[crawler] CRAWL_SOURCE_URL is not set. skip.");
    return [];
  }

  const candidates = buildSourceUrlCandidates(SOURCE_URL);
  let lastError = null;

  for (const url of candidates) {
    try {
      const res = await axios.get(url, { timeout: 30000 });
      const items = Array.isArray(res.data?.items) ? res.data.items : [];

      if (url !== SOURCE_URL) {
        console.warn(`[crawler] fallback source URL used: ${url}`);
      }

      return items
        .map((it) => ({
          url: it.url,
          title: it.title || "",
          thumbnail: it.thumbnail || null,
          category: it.category || null,
          content: it.content || null,
          published_at: normalizePublishedAt(it.published_at),
        }))
        .filter((x) => x.url);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

async function upsertArticles(items) {
  if (!items.length) return { fetched: 0, upserted: 0 };

  // ✅ url UNIQUE가 있어야 ON DUPLICATE KEY UPDATE가 동작합니다.
  const sql = `
    INSERT INTO articles (url, title, thumbnail, category, content, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      thumbnail = VALUES(thumbnail),
      category = VALUES(category),
      content = VALUES(content),
      published_at = VALUES(published_at)
  `;

  let upserted = 0;

  // 트랜잭션까지는 필요 없고, 그냥 순차 실행(또는 batch)로 충분
  for (const a of items) {
    await db.query(sql, [
      a.url,
      a.title,
      a.thumbnail,
      a.category,
      a.content,
      a.published_at,
    ]);
    upserted += 1;
  }

  return { fetched: items.length, upserted };
}

async function runOnce() {
  const items = await fetchArticlesFromSource();
  const result = await upsertArticles(items);
  console.log(
    `[crawler] done fetched=${result.fetched} upserted=${result.upserted} at=${new Date().toISOString()}`
  );
  return result;
}

/**
 * 서버 뜨면 자동으로 15분마다 실행
 */
function startCrawler() {
  // 서버 시작 직후 1회 실행(원하면 제거 가능)
  runOnce().catch((e) => console.error("[crawler] runOnce error:", e));

  setInterval(() => {
    runOnce().catch((e) => console.error("[crawler] interval error:", e));
  }, INTERVAL_MS);

  console.log(`[crawler] scheduled every ${Math.round(INTERVAL_MS / 60000)} minutes`);
}

module.exports = { startCrawler, runOnce };
