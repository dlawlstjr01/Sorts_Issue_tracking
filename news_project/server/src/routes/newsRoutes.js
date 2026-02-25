const express = require("express");
const newsController = require("../controllers/newsController");

const router = express.Router();

// /news?page=1&size=20&category=기타&q=삼성
router.get("/", newsController.list);

// /news/categories
router.get("/categories", newsController.categories);

// /news/123
router.get("/:id", newsController.detail);

module.exports = router;