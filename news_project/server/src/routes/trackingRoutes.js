const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");
const keywordAlertController = require("../controllers/keywordAlertController");
const authService = require("../services/authService");

function requireAuth(req, res, next) {
  try {
    const bearer =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null;
    const token = req.cookies?.accessToken || bearer;
    const payload = authService.verifyToken(token);
    req.user = { id: payload.userId, login_id: payload.loginId };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
}

// GET /tracking/issues?category=it&limit=6
router.get("/issues", trackingController.getIssues);
router.get("/keywords", requireAuth, keywordAlertController.getKeywords);
router.post("/keywords", requireAuth, keywordAlertController.saveKeyword);
router.delete("/keywords/:keywordId", requireAuth, keywordAlertController.deleteKeyword);
router.get("/keyword-alerts", requireAuth, keywordAlertController.getAlerts);
router.post("/keyword-alerts/read", requireAuth, keywordAlertController.markAlertRead);
router.post("/keyword-alerts/read-all", requireAuth, keywordAlertController.markAllAlertsRead);

module.exports = router;
