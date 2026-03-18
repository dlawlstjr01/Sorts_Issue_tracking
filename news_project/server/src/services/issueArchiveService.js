const db = require("../config/DB");

// req.user / req.session / 다양한 구조 대응용
function extractUserId(req) {
    return (
        req?.user?.id ||
        req?.user?.user_id ||
        req?.session?.user?.id ||
        req?.session?.passport?.user?.id ||
        req?.session?.passport?.user ||
        null
    );
}

async function saveIssueArchive(req, issueSummaryId) {
    const userId = req.user?.userId;

    if (!userId) {
        const err = new Error("로그인이 필요합니다.");
        err.status = 401;
        throw err;
    }

    const [existsRows] = await db.query(
        `
    SELECT id
    FROM issue_archives
    WHERE user_id = ? AND issue_summary_id = ?
    LIMIT 1
    `,
        [userId, issueSummaryId]
    );

    if (existsRows.length > 0) {
        return {
            saved: true,
            duplicated: true,
            userId,
            issueSummaryId: Number(issueSummaryId),
        };
    }

    await db.query(
        `
    INSERT INTO issue_archives (user_id, issue_summary_id, saved_at)
    VALUES (?, ?, NOW())
    `,
        [userId, issueSummaryId]
    );

    return {
        saved: true,
        duplicated: false,
        userId,
        issueSummaryId: Number(issueSummaryId),
    };
}

async function removeIssueArchive(req, issueSummaryId) {
    const userId = req.user?.userId;

    if (!userId) {
        const err = new Error("로그인이 필요합니다.");
        err.status = 401;
        throw err;
    }

    await db.query(
        `
    DELETE FROM issue_archives
    WHERE user_id = ? AND issue_summary_id = ?
    `,
        [userId, issueSummaryId]
    );

    return {
        saved: false,
        userId,
        issueSummaryId: Number(issueSummaryId),
    };
}

async function getMyArchiveKeys(req) {
    const userId = req.user?.userId;

    if (!userId) {
        const err = new Error("로그인이 필요합니다.");
        err.status = 401;
        throw err;
    }

    const [rows] = await db.query(
        `
    SELECT issue_summary_id
    FROM issue_archives
    WHERE user_id = ?
    ORDER BY saved_at DESC
    `,
        [userId]
    );

    return rows.map((row) => String(row.issue_summary_id));
}

async function getMyArchivedIssues(req) {
    const userId = req.user?.userId;

    if (!userId) {
        const err = new Error("로그인이 필요합니다.");
        err.status = 401;
        throw err;
    }

    const [rows] = await db.query(
        `
    SELECT
      ia.id AS archive_id,
      ia.saved_at,
      ia.issue_summary_id,
      s.id,
      s.article_id,
      s.short_summary,
      s.ultra_short,
      s.related_count,
      a.category,
      s.created_at
    FROM issue_archives ia
    INNER JOIN issue_summaries s
      ON ia.issue_summary_id = s.id
    LEFT JOIN articles a
      ON s.article_id = a.id
    WHERE ia.user_id = ?
    ORDER BY ia.saved_at DESC
    `,
        [userId]
    );

    return rows;
}

module.exports = {
    saveIssueArchive,
    removeIssueArchive,
    getMyArchiveKeys,
    getMyArchivedIssues,
};