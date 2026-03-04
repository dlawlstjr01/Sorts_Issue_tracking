const axios = require("axios");
const db = require("../config/DB");

// 크롤링 대상(예: 파이썬이 만든 수집 API가 있으면 그걸 호출해도 됨)
const SOURCE_URL = process.env.CRAWL_SOURCE_URL; 
// 15분
const INTERVAL_MS = Number(process.env.CRAWL_INTERVAL_MS || 15 * 60 * 1000);

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

  const res = await axios.get(SOURCE_URL, { timeout: 30000 });
  const items = Array.isArray(res.data?.items) ? res.data.items : [];

  return items.map((it) => ({
    url: it.url,
    title: it.title || "",
    thumbnail: it.thumbnail || null,
    category: it.category || null,
    content: it.content || null,
    published_at: it.published_at || null,
  })).filter((x) => x.url);
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