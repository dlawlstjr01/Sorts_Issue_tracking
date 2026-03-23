const express = require("express");
const router = express.Router();
const { getNotices } = require("../services/noticeService");

router.get("/", getNotices);

module.exports = router;