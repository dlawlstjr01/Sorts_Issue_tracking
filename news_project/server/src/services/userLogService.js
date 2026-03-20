const db = require("../config/DB"); // 당신 프로젝트 DB 커넥션 경로에 맞추세요

exports.createLog = async ({ userId, articleId, url }) => {
  const uid = Number(userId);
  const aid = Number(articleId);

  if (!Number.isFinite(uid) || uid <= 0) {
    const e = new Error("userId가 유효하지 않습니다.");
    e.status = 400;
    throw e;
  }

  let finalAid = Number.isFinite(aid) && aid > 0 ? aid : null;

  // 1) articleId가 왔으면 articles에서 존재 확인
  if (finalAid != null) {
    const [aRows] = await db.query(
      `SELECT id FROM articles WHERE id = ? LIMIT 1`,
      [finalAid]
    );
    if (aRows.length === 0) finalAid = null; // 없으면 url로 재시도
  }

  // 2) id가 없거나 존재하지 않으면 url로 id 찾기
  if (finalAid == null) {
    if (!url) {
      const e = new Error("articleId가 articles에 없고, url도 없습니다.");
      e.status = 400;
      throw e;
    }

    const [uRows] = await db.query(
      `SELECT id FROM articles WHERE url = ? LIMIT 1`,
      [url]
    );

    if (uRows.length === 0) {
      const e = new Error(`articles에 없는 url 입니다: ${url}`);
      e.status = 400;
      throw e;
    }

    finalAid = uRows[0].id;
  }

  const [result] = await db.query(
    `INSERT INTO user_log (user_id, article_id, stay_time, scroll_depth)
     VALUES (?, ?, ?, ?)`,
    [uid, finalAid, 0, 0]
  );

  return { logId: result.insertId, articleId: finalAid };
};

exports.updateLog = async ({ logId, stayTime, scrollDepth }) => {
  const st = Number.isFinite(stayTime) ? Math.max(0, Math.floor(stayTime)) : 0;
  const sd = Number.isFinite(scrollDepth)
    ? Math.max(0, Math.min(100, Math.floor(scrollDepth)))
    : 0;

  const [result] = await db.query(
    `UPDATE user_log
     SET stay_time = ?, scroll_depth = ?
     WHERE log_id = ?`,
    [st, sd, logId]
  );

  return { updated: result.affectedRows > 0 };
};

// 기존 함수: article_id만 필요한 경우 사용
exports.getRecentSeenArticleIds = async ({ userId, limit = 50 }) => {
  const uid = Number(userId);
  const lim = Math.max(1, Math.min(200, Number(limit) || 50));

  if (!Number.isFinite(uid) || uid <= 0) {
    const e = new Error("userId가 유효하지 않습니다.");
    e.status = 400;
    throw e;
  }

  const [rows] = await db.query(
    `SELECT article_id
     FROM user_log
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [uid, lim]
  );

  // 중복 제거(최근 순 유지)
  const seen = new Set();
  const ids = [];

  for (const r of rows) {
    const id = String(r.article_id);
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(Number(r.article_id));
    }
  }

  return ids;
};

// 추가 함수: 최근 본 기사 목록을 최신순으로 바로 렌더링할 수 있게 반환
exports.getRecentSeenArticles = async ({ userId, limit = 20 }) => {
  const uid = Number(userId);
  const lim = Math.max(1, Math.min(200, Number(limit) || 20));

  if (!Number.isFinite(uid) || uid <= 0) {
    const e = new Error("userId가 유효하지 않습니다.");
    e.status = 400;
    throw e;
  }

  const [rows] = await db.query(
    `
    SELECT
      a.id AS article_id,
      a.title,
      a.content,
      a.thumbnail,
      a.category,
      a.url,
      a.published_at,
      recent.last_viewed_at,
      s.short_summary,
      s.ultra_short,
      s.keywords,
      s.id AS issue_summary_id
    FROM (
      SELECT
        article_id,
        MAX(created_at) AS last_viewed_at
      FROM user_log
      WHERE user_id = ?
      GROUP BY article_id
      ORDER BY last_viewed_at DESC
      LIMIT ?
    ) recent
    INNER JOIN articles a
      ON a.id = recent.article_id
    LEFT JOIN issue_summaries s
      ON s.id = (
        SELECT s2.id
        FROM issue_summaries s2
        WHERE s2.article_id = a.id
        ORDER BY s2.created_at DESC, s2.id DESC
        LIMIT 1
      )
    ORDER BY recent.last_viewed_at DESC
    `,
    [uid, lim]
  );

  return rows;
};

exports.deleteRecentSeenArticle = async ({ userId, articleId }) => {
  const uid = Number(userId);
  const aid = Number(articleId);

  if (!Number.isFinite(uid) || uid <= 0) {
    const e = new Error("userId가 유효하지 않습니다.");
    e.status = 400;
    throw e;
  }

  if (!Number.isFinite(aid) || aid <= 0) {
    const e = new Error("articleId가 유효하지 않습니다.");
    e.status = 400;
    throw e;
  }

  const [result] = await db.query(
    `DELETE FROM user_log
     WHERE user_id = ? AND article_id = ?`,
    [uid, aid]
  );

  return { deleted: result.affectedRows };
};

exports.clearRecentSeenArticles = async ({ userId }) => {
  const uid = Number(userId);

  if (!Number.isFinite(uid) || uid <= 0) {
    const e = new Error("userId가 유효하지 않습니다.");
    e.status = 400;
    throw e;
  }

  const [result] = await db.query(
    `DELETE FROM user_log
     WHERE user_id = ?`,
    [uid]
  );

  return { deleted: result.affectedRows };
};
