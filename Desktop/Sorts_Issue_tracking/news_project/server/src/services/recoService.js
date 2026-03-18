const axios = require("axios");
const db = require("../config/DB");

const RECO_BASE_URL = process.env.RECO_BASE_URL || "http://reco:8000";

/**
 * 최근 본 기사 article_id 목록을 user_log에서 가져오기 (중복 제거, 최근 순 유지)
 */
async function fetchRecentSeenArticleIds(userId, limit = 80) {
  const lim = Math.max(1, Math.min(200, Number(limit) || 80));

  const sql = `
    SELECT ul.article_id
    FROM user_log ul
    WHERE ul.user_id = ?
    ORDER BY ul.created_at DESC
    LIMIT ?
  `;

  const [rows] = await db.query(sql, [userId, lim]);

  const seen = new Set();
  const ids = [];
  for (const r of rows) {
    const id = String(r.article_id);
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

/**
 * Python 추천 서버 호출
 * - 로그인:  GET /reco?userId=...&k=...
 * - 비로그인: GET /reco?k=...
 */
async function fetchRecoFromPython({ userId, k }) {
  const url = `${RECO_BASE_URL}/reco`;

  const params = { k };

  // 로그인 사용자일 때만 userId 전달
  if (userId && Number(userId) > 0) {
    params.userId = Number(userId);
  }

  const res = await axios.get(url, { params, timeout: 8000 });
  return res.data; // { items: [...] }
}

/**
 * url 목록으로 articles 조회 (추천 결과 순서 유지)
 */
async function fetchArticlesByUrls(urls) {
  if (!urls || urls.length === 0) return [];

  const uniq = Array.from(new Set(urls));
  if (uniq.length === 0) return [];

  const placeholders = uniq.map(() => "?").join(",");

  const sql = `
    SELECT id, url, title, thumbnail, content, published_at, category, created_at
    FROM articles
    WHERE url IN (${placeholders})
    ORDER BY FIELD(url, ${placeholders})
    LIMIT 200
  `;

  const params = [...uniq, ...uniq];
  const [rows] = await db.query(sql, params);
  return rows;
}

/**
 * python recoItems(url 기반) + DB articles(url 기준) 합치기
 */
function mergeRecoWithArticles(recoItems, articleRows) {
  const byUrl = new Map();
  for (const a of articleRows) {
    byUrl.set(a.url, a);
  }

  const out = [];
  for (const r of recoItems) {
    const url = r?.url;
    if (!url) continue;

    const a = byUrl.get(url);
    if (!a) continue;

    out.push({
      id: a.id,
      url: a.url,
      title: a.title,
      thumbnail: a.thumbnail,
      content: a.content,
      published_at: a.published_at,
      category: a.category,
      created_at: a.created_at,
      reco: {
        category_for_model: r.category_for_model || r.category || null,
        source: r.source || null,
        topic_id: r.topic_id ?? null,
        item_idx: r.item_idx ?? null,
        score: r.score ?? null,
      },
    });
  }

  return out;
}

exports.getRecommendations = async ({ userId, k = 20 }) => {
  const kk = Math.max(1, Math.min(50, Number(k) || 20));
  const uid = userId ? Number(userId) : null;

  const reco = await fetchRecoFromPython({ userId: uid, k: kk });
  const recoItems = Array.isArray(reco?.items) ? reco.items : [];

  const urls = recoItems.map((x) => x?.url).filter(Boolean);
  const articles = await fetchArticlesByUrls(urls);
  const merged = mergeRecoWithArticles(recoItems, articles);

  return {
    userId: uid,
    k: kk,
    isPersonalized: !!(uid && uid > 0),
    items: merged,
    missing: Math.max(0, urls.length - merged.length),
  };
};