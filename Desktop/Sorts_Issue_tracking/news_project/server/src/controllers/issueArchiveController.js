const issueArchiveService = require("../services/issueArchiveService");

async function saveIssueArchive(req, res) {
  try {
    const { issueSummaryId } = req.params;

    if (!issueSummaryId) {
      return res.status(400).json({
        message: "issueSummaryId가 필요합니다.",
      });
    }

    const result = await issueArchiveService.saveIssueArchive(req, issueSummaryId);

    return res.status(200).json({
      message: result.duplicated ? "이미 저장된 이슈입니다." : "저장되었습니다.",
      ...result,
    });
  } catch (err) {
    console.error("[saveIssueArchive] error:", err);
    return res.status(err.status || 500).json({
      message: err.message || "이슈 저장 중 오류가 발생했습니다.",
    });
  }
}

async function removeIssueArchive(req, res) {
  try {
    const { issueSummaryId } = req.params;

    if (!issueSummaryId) {
      return res.status(400).json({
        message: "issueSummaryId가 필요합니다.",
      });
    }

    const result = await issueArchiveService.removeIssueArchive(req, issueSummaryId);

    return res.status(200).json({
      message: "저장이 해제되었습니다.",
      ...result,
    });
  } catch (err) {
    console.error("[removeIssueArchive] error:", err);
    return res.status(err.status || 500).json({
      message: err.message || "이슈 저장 해제 중 오류가 발생했습니다.",
    });
  }
}

async function getMyArchiveKeys(req, res) {
  try {
    const items = await issueArchiveService.getMyArchiveKeys(req);

    return res.status(200).json({
      items,
    });
  } catch (err) {
    console.error("[getMyArchiveKeys] error:", err);
    return res.status(err.status || 500).json({
      message: err.message || "저장 키 조회 중 오류가 발생했습니다.",
    });
  }
}

async function getMyArchivedIssues(req, res) {
  try {
    const items = await issueArchiveService.getMyArchivedIssues(req);

    return res.status(200).json({
      items,
    });
  } catch (err) {
    console.error("[getMyArchivedIssues] error:", err);
    return res.status(err.status || 500).json({
      message: err.message || "저장된 이슈 조회 중 오류가 발생했습니다.",
    });
  }
}

module.exports = {
  saveIssueArchive,
  removeIssueArchive,
  getMyArchiveKeys,
  getMyArchivedIssues,
};