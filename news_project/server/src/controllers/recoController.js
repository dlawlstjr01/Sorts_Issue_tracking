const recoService = require("../services/recoService");

// GET /reco?k=20&userId=123
exports.getReco = async (req, res) => {
  // catch에서도 동일 값을 사용해야 해서 try 바깥에서 파싱한다.
  const k = Math.min(50, Math.max(1, parseInt(req.query.k || "20", 10)));
  const rawUserId = req.query.userId;
  const userIdNum = rawUserId ? Number(rawUserId) : null;
  const userId = Number.isFinite(userIdNum) && userIdNum > 0 ? userIdNum : null;

  try {
    const data = await recoService.getRecommendations({ userId, k });
    return res.json(data);
  } catch (err) {
    console.error("[reco] error:", err?.message || err);
    // 추천 백엔드(Python/DB) 장애가 있어도 메인 화면은 정상 동작하도록 200 + 빈 목록으로 강등한다.
    return res.status(200).json({
      message: "추천 데이터를 일시적으로 불러오지 못했습니다.",
      userId,
      k,
      items: [],
      missing: 0,
      degraded: true,
    });
  }
};
