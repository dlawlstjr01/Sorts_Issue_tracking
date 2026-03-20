const searchService = require("../services/searchService");

async function getGlossary(req, res) {
  try {
    const glossary = await searchService.getAllGlossaryTerms();

    return res.json({
      glossary,
    });
  } catch (error) {
    console.error("getGlossary error:", error);
    return res.status(500).json({ message: "용어 조회 중 오류가 발생했습니다." });
  }
}

module.exports = {
  getGlossary,
};