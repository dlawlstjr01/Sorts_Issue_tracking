const db = require("../config/DB");
const newsService = require("./newsService");

const DEFAULT_ISSUE_FETCH_LIMIT = 120;
const MAX_ISSUE_FETCH_LIMIT = 300;
const MAX_ALERT_ITEMS = 20;

function makeError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeKeyword(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUserId(value) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) {
    throw makeError("로그인이 필요합니다.", 401);
  }
  return id;
}

function toEpoch(value) {
  const ts = new Date(value || 0).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function toIssueSummaryId(issue = {}) {
  const id = parsePositiveInt(
    issue.issue_summary_id || issue.issueSummaryId || issue.id || issue.issueId
  );
  return id;
}

function toIssueUpdatedAt(issue = {}) {
  return (
    issue.updated_at ||
    issue.published_at ||
    issue.created_at ||
    issue.updatedAt ||
    issue.publishedAt ||
    issue.createdAt ||
    ""
  );
}

function toIssueRelatedCount(issue = {}) {
  const directCount = Number(issue.related_count || issue.relatedCount || 0);
  if (Number.isFinite(directCount) && directCount > 0) {
    return directCount;
  }

  return Array.isArray(issue.related_articles) ? issue.related_articles.length : 0;
}

function mapIssueToAlertCandidate(issue = {}) {
  const issueSummaryId = toIssueSummaryId(issue);
  const articleId = parsePositiveInt(issue.article_id || issue.articleId);
  const title = String(issue.title || "").trim() || "(제목 없음)";
  const summary = String(
    issue.short_summary ||
      issue.ultra_short ||
      issue.summary ||
      issue.background ||
      ""
  ).trim();

  const updatedAt = String(toIssueUpdatedAt(issue) || "");
  const searchText = [
    title,
    summary,
    issue.background,
    issue.keywords,
    issue.category,
    issue.press_name,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    issueSummaryId,
    articleId,
    title,
    summary,
    category: String(issue.category || "").trim(),
    pressName: String(issue.press_name || "").trim(),
    relatedCount: toIssueRelatedCount(issue),
    url: String(issue.url || "").trim(),
    thumbnail: String(issue.thumbnail || "").trim(),
    updatedAt,
    publishedAt: String(issue.published_at || issue.created_at || updatedAt || "").trim(),
    searchText,
    issueTs: toEpoch(updatedAt),
  };
}

async function getActiveKeywordRows(userId) {
  const uid = normalizeUserId(userId);

  const [rows] = await db.query(
    `
    SELECT
      id,
      user_id,
      issue_summary_id,
      keyword,
      is_active,
      created_at,
      updated_at
    FROM user_issue_keywords
    WHERE user_id = ?
      AND is_active = 1
    ORDER BY updated_at DESC, id DESC
    `,
    [uid]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    userId: Number(row.user_id),
    issueSummaryId: parsePositiveInt(row.issue_summary_id) || null,
    keyword: String(row.keyword || "").trim(),
    isActive: Number(row.is_active || 0) === 1,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }));
}

async function listUserKeywords(userId) {
  return getActiveKeywordRows(userId);
}

async function getInitialIssueSummaryId() {
  const [rows] = await db.query(
    `
    SELECT id
    FROM issue_summaries
    ORDER BY id ASC
    LIMIT 1
    `
  );

  const fallbackId = parsePositiveInt(rows?.[0]?.id);
  if (!fallbackId) {
    throw makeError("이슈 요약 데이터가 아직 없어 키워드를 저장할 수 없습니다.", 503);
  }

  return fallbackId;
}

async function saveUserKeyword(userId, keyword) {
  const uid = normalizeUserId(userId);
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    throw makeError("키워드를 입력해주세요.", 400);
  }

  if (normalizedKeyword.length > 100) {
    throw makeError("키워드는 100자 이하로 입력해주세요.", 400);
  }

  // user_issue_keywords.issue_summary_id 컬럼이 NOT NULL + FK인 환경 대응
  const initialIssueSummaryId = await getInitialIssueSummaryId();

  const [existingRows] = await db.query(
    `
    SELECT id
    FROM user_issue_keywords
    WHERE user_id = ?
      AND LOWER(TRIM(keyword)) = LOWER(TRIM(?))
    ORDER BY id DESC
    LIMIT 1
    `,
    [uid, normalizedKeyword]
  );

  if (existingRows.length > 0) {
    await db.query(
      `
      UPDATE user_issue_keywords
      SET
        keyword = ?,
        is_active = 1,
        issue_summary_id = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [normalizedKeyword, initialIssueSummaryId, existingRows[0].id, uid]
    );
  } else {
    await db.query(
      `
      INSERT INTO user_issue_keywords
        (user_id, issue_summary_id, keyword, is_active, created_at, updated_at)
      VALUES
        (?, ?, ?, 1, NOW(), NOW())
      `,
      [uid, initialIssueSummaryId, normalizedKeyword]
    );
  }

  return listUserKeywords(uid);
}

async function deleteUserKeyword(userId, keywordId) {
  const uid = normalizeUserId(userId);
  const id = parsePositiveInt(keywordId);
  if (!id) {
    throw makeError("삭제할 키워드 ID가 유효하지 않습니다.", 400);
  }

  const [result] = await db.query(
    `
    UPDATE user_issue_keywords
    SET
      is_active = 0,
      updated_at = NOW()
    WHERE id = ?
      AND user_id = ?
      AND is_active = 1
    `,
    [id, uid]
  );

  if (!result.affectedRows) {
    throw makeError("키워드를 찾을 수 없습니다.", 404);
  }

  return true;
}

function findMatchedIssue(issues, keywordLower) {
  return issues.find((issue) => issue.searchText.includes(keywordLower)) || null;
}

async function getKeywordAlerts(userId, { issueLimit = DEFAULT_ISSUE_FETCH_LIMIT } = {}) {
  const uid = normalizeUserId(userId);
  const safeIssueLimit = Math.min(
    MAX_ISSUE_FETCH_LIMIT,
    Math.max(20, Number(issueLimit) || DEFAULT_ISSUE_FETCH_LIMIT)
  );

  const [keywords, issueRows] = await Promise.all([
    getActiveKeywordRows(uid),
    newsService.getIssues(safeIssueLimit),
  ]);

  if (!keywords.length) {
    return {
      keywords: [],
      unreadCount: 0,
      items: [],
    };
  }

  const issueCandidates = (Array.isArray(issueRows) ? issueRows : [])
    .map(mapIssueToAlertCandidate)
    .filter((issue) => issue.issueSummaryId > 0)
    .sort((a, b) => b.issueTs - a.issueTs);

  const alertItems = [];

  keywords.forEach((keywordRow) => {
    const keywordText = normalizeKeyword(keywordRow.keyword);
    if (!keywordText) return;

    const matched = findMatchedIssue(issueCandidates, keywordText.toLowerCase());
    if (!matched) return;

    const isRead = Number(keywordRow.issueSummaryId || 0) === Number(matched.issueSummaryId || 0);
    alertItems.push({
      id: `${keywordRow.id}:${matched.issueSummaryId}`,
      keywordId: keywordRow.id,
      keyword: keywordText,
      issueSummaryId: matched.issueSummaryId,
      articleId: matched.articleId || null,
      title: matched.title,
      summary: matched.summary,
      category: matched.category,
      pressName: matched.pressName,
      relatedCount: matched.relatedCount,
      url: matched.url,
      thumbnail: matched.thumbnail,
      updatedAt: matched.updatedAt,
      publishedAt: matched.publishedAt,
      eventType: isRead ? "updated" : "new",
      isRead,
    });
  });

  const sortedItems = alertItems
    .sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return toEpoch(b.updatedAt) - toEpoch(a.updatedAt);
    })
    .slice(0, MAX_ALERT_ITEMS);

  const unreadCount = sortedItems.reduce(
    (count, item) => (item.isRead ? count : count + 1),
    0
  );

  return {
    keywords: keywords.map((item) => ({
      id: item.id,
      keyword: item.keyword,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    unreadCount,
    items: sortedItems,
  };
}

async function markKeywordAlertRead(userId, { keywordId, issueSummaryId }) {
  const uid = normalizeUserId(userId);
  const kid = parsePositiveInt(keywordId);
  const sid = parsePositiveInt(issueSummaryId);

  if (!kid || !sid) {
    throw makeError("읽음 처리 정보가 유효하지 않습니다.", 400);
  }

  const [result] = await db.query(
    `
    UPDATE user_issue_keywords
    SET
      issue_summary_id = ?,
      updated_at = NOW()
    WHERE id = ?
      AND user_id = ?
      AND is_active = 1
    `,
    [sid, kid, uid]
  );

  if (!result.affectedRows) {
    throw makeError("읽음 처리할 알림을 찾을 수 없습니다.", 404);
  }

  return true;
}

async function markAllKeywordAlertsRead(userId, { issueLimit = DEFAULT_ISSUE_FETCH_LIMIT } = {}) {
  const uid = normalizeUserId(userId);
  const payload = await getKeywordAlerts(uid, { issueLimit });
  const unreadItems = payload.items.filter((item) => !item.isRead);

  for (const item of unreadItems) {
    await db.query(
      `
      UPDATE user_issue_keywords
      SET
        issue_summary_id = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
        AND is_active = 1
      `,
      [item.issueSummaryId, item.keywordId, uid]
    );
  }

  return { updated: unreadItems.length };
}

module.exports = {
  listUserKeywords,
  saveUserKeyword,
  deleteUserKeyword,
  getKeywordAlerts,
  markKeywordAlertRead,
  markAllKeywordAlertsRead,
};
