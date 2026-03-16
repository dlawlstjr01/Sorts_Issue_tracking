const newsService = require("../services/newsService");
const dictionaryService = require("../services/dictionaryService");

// GET /news?page=&size=&category=&q=
exports.list = async (req, res) => {
  try {
    const data = await newsService.listArticles(req.query);
    return res.json(data);
  } catch (err) {
    console.error("[newsController.list]", err);
    return res.status(err.statusCode || 500).json({ message: err.message || "서버 오류" });
  }
};

// GET /news/:id
exports.detail = async (req, res) => {
  try {
    const data = await newsService.getArticle(req.params.id);
    return res.json(data);
  } catch (err) {
    console.error("[newsController.detail]", err);
    return res.status(err.statusCode || 500).json({ message: err.message || "서버 오류" });
  }
};

// GET /news/categories
exports.categories = async (req, res) => {
  try {
    const items = await newsService.listCategories();
    return res.json({ items });
  } catch (err) {
    console.error("[newsController.categories]", err);
    return res.status(err.statusCode || 500).json({ message: err.message || "서버 오류" });
  }
};

exports.summary = async (req, res) => {
  try {
    const articleId = Number(req.body?.articleId);
    if (!articleId) {
      return res.status(400).json({ message: "articleId가 필요합니다." });
    }

    const result = await newsService.getIssueSummaryByArticleId(articleId);

    if (!result) {
      return res.status(404).json({ message: "요약을 불러오지 못했습니다." });
    }

    return res.json(result); // { lines: [...], related_count, keywords, created_at }
  } catch (e) {
    console.error("[news/summary] failed:", e);
    return res.status(500).json({ message: "요약을 불러오지 못했습니다." });
  }
};

exports.dictionarySearch = async (req, res) => {
  try {
    const data = await dictionaryService.searchDictionary(req.query.q);
    return res.json(data);
  } catch (err) {
    console.error("[newsController.dictionarySearch]", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "사전 검색 중 오류가 발생했습니다." });
  }
};
