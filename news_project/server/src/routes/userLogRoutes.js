const express = require("express");
const router = express.Router();
const userLogController = require("../controllers/userLogController");
const authService = require("../services/authService");

const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    const payload = authService.verifyToken(token); // { userId, loginId, iat, exp }
    req.user = { id: payload.userId, login_id: payload.loginId };
    next();
  } catch (e) {
    console.log("LOG AUTH FAIL:", e.message);
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
};

router.post("/", requireAuth, userLogController.createLog);
router.put("/:logId", requireAuth, userLogController.updateLog);

module.exports = router;