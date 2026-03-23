const db = require("../config/DB");

exports.getNotices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, content, created_at
      FROM notices
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("공지사항 조회 실패:", err);
    res.status(500).json({ message: "공지사항 조회 실패" });
  }
};