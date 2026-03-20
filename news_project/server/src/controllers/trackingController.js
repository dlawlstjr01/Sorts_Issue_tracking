const trackingService = require("../services/trackingService");

exports.getIssues = async (req, res) => {
  try {
    const category = req.query.category || "";
    const limit = Number(req.query.limit || 6);
    const article_id = req.query.article_id
      ? Number(req.query.article_id)
      : undefined;

    const data = await trackingService.getIssues({
      category,
      limit,
      article_id,
    });

    return res.json(data);
  } catch (e) {
    console.error("[tracking] getIssues failed:", e);
    return res.json({
      items: [],
      issues: [],
      data: [],
      fallback: true,
      message: "tracking issues fetch failed",
    });
  }
};
