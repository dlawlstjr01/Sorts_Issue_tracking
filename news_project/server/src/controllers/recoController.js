const recoService = require("../services/recoService");

// GET /reco?k=20&userId=123
exports.getReco = async (req, res) => {
  try {
    const k = Math.min(50, Math.max(1, parseInt(req.query.k || "20", 10)));

    // 1) 세션 쓰면: const userIdFromAuth = req.session?.user?.id;
    // 2) JWT 쓰면: const userIdFromAuth = req.user?.id;
    // 3) 테스트: 쿼리로 받기
    const rawUserId = req.query.userId;
    const userIdNum = rawUserId ? Number(rawUserId) : null;
    const userId = Number.isFinite(userIdNum) && userIdNum > 0 ? userIdNum : null;

    const data = await recoService.getRecommendations({ userId, k });
    return res.json(data);
  } catch (err) {
    console.error("[reco] error:", err?.message || err);
    return res
      .status(500)
      .json({ message: "추천을 불러오지 못했습니다.", items: [] });
  }
};