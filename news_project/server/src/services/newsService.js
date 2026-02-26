const db = require("../config/DB");

// 간단한 에러 객체(status 포함)
function makeError(message, statusCode) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

// 목록 조회 (페이지네이션 + 카테고리 + 검색)
exports.listArticles = async ({ page, size, category, q, date_from, date_to }) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const s = Math.min(50, Math.max(1, parseInt(size, 10) || 20));
  const offset = (p - 1) * s;

  const where = [];
  const params = [];

  if (category) {
    where.push("category = ?");
    params.push(String(category));
  }

  if (q) {
    const keyword = String(q).trim();
    if (keyword) {
      where.push("(title LIKE ? OR content LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
  }

  if (date_from && isDateString(date_from)) {
    where.push("DATE(COALESCE(published_at, created_at)) >= ?");
    params.push(String(date_from));
  }

  if (date_to && isDateString(date_to)) {
    where.push("DATE(COALESCE(published_at, created_at)) <= ?");
    params.push(String(date_to));
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // total
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM articles ${whereSql}`,
    params
  );
  const total = countRows?.[0]?.cnt ?? 0;

  // items
  const [rows] = await db.query(
    `
    SELECT id, url, title, thumbnail, category, published_at, created_at
    FROM articles
    ${whereSql}
    ORDER BY (published_at IS NULL), published_at DESC, id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, s, offset]
  );

  return { page: p, size: s, total, items: rows };
};

// 상세 조회
exports.getArticle = async (id) => {
  const articleId = Number(id);
  if (!Number.isFinite(articleId)) throw makeError("id가 올바르지 않습니다.", 400);

  const [rows] = await db.query(
    `
    SELECT id, url, title, thumbnail, content, category, published_at, created_at
    FROM articles
    WHERE id = ?
    LIMIT 1
    `,
    [articleId]
  );

  if (!rows.length) throw makeError("기사를 찾을 수 없습니다.", 404);
  return rows[0];
};

// 카테고리 목록
exports.listCategories = async () => {
  const [rows] = await db.query(
    `
    SELECT category, COUNT(*) AS cnt
    FROM articles
    WHERE category IS NOT NULL AND category <> ''
    GROUP BY category
    ORDER BY cnt DESC
    `
  );

  return rows;
};
