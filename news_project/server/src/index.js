import express from "express";
import cors from "cors";
import newsRouter from "./routes/news.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/news", newsRouter);

const PORT = process.env.PORT || 5000;
// 도커 밖(호스트)에서 접근되게 0.0.0.0 필수
app.listen(PORT, "0.0.0.0", () => console.log("server on", PORT));
