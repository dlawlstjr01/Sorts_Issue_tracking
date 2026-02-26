const express = require("express");
const router = express.Router();
const recoController = require("../controllers/recoController");

/**
 * 추천 조회
 *
 * GET /reco?userId=123&k=20
 *
 * query:
 *   userId (optional) : 사용자 ID
 *   k      (optional) : 추천 개수 (default 20)
 *
 * response:
 * {
 *   userId,
 *   k,
 *   items: [...],
 *   missing: number
 * }
 */
router.get("/", recoController.getReco);

module.exports = router;