const express = require("express");
const newsController = require("../controllers/newsController");

const router = express.Router();

// /news?page=1&size=20&category=기타&q=삼성
router.get("/", newsController.list);


router.get("/categories", newsController.categories);
router.get("/dictionary/search", newsController.dictionarySearch);
router.post("/summary", newsController.summary);

// 이슈추적
router.get("/issues", newsController.getIssues);
router.get("/articles/:id", newsController.getArticle);


router.get("/:id/terms", newsController.terms);
router.get("/:id", newsController.detail);

module.exports = router;