const express = require('express');
const router = express.Router();

router.get("/trending", (req, res) => {
  res.json([{ id: 1, title: "예시 이슈", score: 92 }]);
});

router.get("/summary", (req, res) => {
  res.json({ summary: "요약 예시" });
});

module.exports = router;
