const trackingService = require("../services/trackingService");

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

exports.getIssues = async (req, res) => {
  try {
    const category = req.query.category || "";
    const limit = parseOptionalNumber(req.query.limit) || 6;
    const article_id = parseOptionalNumber(req.query.article_id);
    const include_related = parseOptionalNumber(req.query.include_related);
    const include_article_content = parseOptionalNumber(req.query.include_article_content);
    const refresh_summary = parseOptionalNumber(req.query.refresh_summary);

    const data = await trackingService.getIssues({
      category,
      limit,
      article_id,
      include_related,
      include_article_content,
      refresh_summary,
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
