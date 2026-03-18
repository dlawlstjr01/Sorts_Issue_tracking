const userLogService = require("../services/userLogService");

exports.createLog = async (req, res) => {
  try {
    const userId = req.user?.id;

    const articleId = req.body.articleId ?? req.body.article_id;
    const url = req.body.url;

    if (!userId) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (!articleId && !url) {
      return res.status(400).json({ message: "articleId 또는 url이 필요합니다." });
    }

    const data = await userLogService.createLog({ userId, articleId, url });
    return res.status(201).json(data);
  } catch (err) {
    console.error("createLog error:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "로그 생성 실패" });
  }
};

exports.updateLog = async (req, res) => {
  try {
    const { logId } = req.params;

    const stayTime = req.body.stayTime ?? req.body.stay_time ?? req.body.dwellMs ?? 0;
    const scrollDepth = req.body.scrollDepth ?? req.body.scroll_depth ?? 0;

    if (!logId) {
      return res.status(400).json({ message: "logId가 필요합니다." });
    }

    const data = await userLogService.updateLog({
      logId,
      stayTime: Number(stayTime),
      scrollDepth: Number(scrollDepth),
    });

    return res.json(data);
  } catch (err) {
    console.error("updateLog error:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "로그 업데이트 실패" });
  }
};

exports.getRecentSeenArticles = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = req.query.limit ?? 20;

    if (!userId) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const rows = await userLogService.getRecentSeenArticles({
      userId,
      limit: Number(limit),
    });

    return res.json(rows);
  } catch (err) {
    console.error("getRecentSeenArticles error:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "최근 본 기사 조회 실패" });
  }
};

exports.getRecentSeenArticleIds = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = req.query.limit ?? 50;

    if (!userId) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const ids = await userLogService.getRecentSeenArticleIds({
      userId,
      limit: Number(limit),
    });

    return res.json(ids);
  } catch (err) {
    console.error("getRecentSeenArticleIds error:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "최근 본 기사 ID 조회 실패" });
  }
};