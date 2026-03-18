const express = require("express");
const router = express.Router();
const issueArchiveController = require("../controllers/issueArchiveController");
const authController = require("../controllers/authController");

router.post("/:issueSummaryId", authController.verifyToken, issueArchiveController.saveIssueArchive);
router.delete("/:issueSummaryId", authController.verifyToken, issueArchiveController.removeIssueArchive);
router.get("/my/keys", authController.verifyToken, issueArchiveController.getMyArchiveKeys);
router.get("/my", authController.verifyToken, issueArchiveController.getMyArchivedIssues);

module.exports = router;