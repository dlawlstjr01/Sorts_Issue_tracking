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
    const [aRows] = await db.query(`SELECT id FROM articles WHERE id = ? LIMIT 1`, [finalAid]);
    if (aRows.length === 0) finalAid = null; // 없으면 url로 재시도
  }

  // 2) id가 없거나 존재하지 않으면 url로 id 찾기
  if (finalAid == null) {
    if (!url) {
      const e = new Error("articleId가 articles에 없고, url도 없습니다.");
      e.status = 400;
      throw e;
    }
    const [uRows] = await db.query(`SELECT id FROM articles WHERE url = ? LIMIT 1`, [url]);
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
  // null 방지 + 범위 보정
  const st = Number.isFinite(stayTime) ? Math.max(0, Math.floor(stayTime)) : 0;
  const sd = Number.isFinite(scrollDepth) ? Math.max(0, Math.min(100, Math.floor(scrollDepth))) : 0;

  const [result] = await db.query(
    `UPDATE user_log
     SET stay_time = ?, scroll_depth = ?
     WHERE log_id = ?`,
    [st, sd, logId]
  );

  return { updated: result.affectedRows > 0 };
};

exports.getRecentSeenArticleIds = async ({ userId, limit = 50 }) => {
  const lim = Math.max(1, Math.min(200, Number(limit) || 50));

  const [rows] = await db.query(
    `SELECT article_id
     FROM user_log
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, lim]
  );

  // 중복 제거(최근 순 유지)
  const seen = new Set();
  const ids = [];
  for (const r of rows) {
    const id = String(r.article_id);
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
};