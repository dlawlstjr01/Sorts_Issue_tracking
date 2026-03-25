const keywordAlertService = require("../services/keywordAlertService");

function resolveUserId(req) {
  return req.user?.id || req.user?.userId || null;
}

exports.getKeywords = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await keywordAlertService.listUserKeywords(userId);
    return res.json({ items });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "키워드 목록 조회에 실패했습니다.",
    });
  }
};

exports.saveKeyword = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const keyword = req.body?.keyword;
    const items = await keywordAlertService.saveUserKeyword(userId, keyword);
    return res.status(201).json({ items });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "키워드 저장에 실패했습니다.",
    });
  }
};

exports.deleteKeyword = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const keywordId = req.params?.keywordId;
    await keywordAlertService.deleteUserKeyword(userId, keywordId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "키워드 삭제에 실패했습니다.",
    });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const issueLimit = Number(req.query?.limit || 120);
    const payload = await keywordAlertService.getKeywordAlerts(userId, { issueLimit });
    return res.json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "키워드 알림 조회에 실패했습니다.",
    });
  }
};

exports.markAlertRead = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const keywordId = req.body?.keywordId;
    const issueSummaryId = req.body?.issueSummaryId;
    await keywordAlertService.markKeywordAlertRead(userId, {
      keywordId,
      issueSummaryId,
    });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "알림 읽음 처리에 실패했습니다.",
    });
  }
};

exports.markAllAlertsRead = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const issueLimit = Number(req.body?.limit || req.query?.limit || 120);
    const result = await keywordAlertService.markAllKeywordAlertsRead(userId, {
      issueLimit,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "전체 읽음 처리에 실패했습니다.",
    });
  }
};
