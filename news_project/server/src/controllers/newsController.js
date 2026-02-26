const newsService = require("../services/newsService");

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