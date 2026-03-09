const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");

// GET /tracking/issues?category=it&limit=6
router.get("/issues", trackingController.getIssues);

module.exports = router;