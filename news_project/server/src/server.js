const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const authRoutes = require("./routes/authRoutes");
const initPassport = require("./config/passport");
const newsRoutes = require("./routes/newsRoutes");
const recoRoutes = require("./routes/recoRoutes");
const userLogRoutes = require("./routes/userLogRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const { startCrawler } = require("./services/crawlerService");
const issueArchiveRoutes = require("./routes/issueArchiveRoutes");
const { warmIssuesCache } = require("./services/trackingService");
const searchRoutes = require("./routes/searchRoutes");

const ENABLE_CRAWLER =
  String(process.env.ENABLE_CRAWLER || "true").toLowerCase() === "true";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
if (ENABLE_CRAWLER) {
  startCrawler();
} else {
  console.log("[crawler] disabled by ENABLE_CRAWLER=false");
}
initPassport();
//  /auth/login, /auth/me, /auth/logout

app.use("/auth", authRoutes);
app.use("/news", newsRoutes);
app.use("/reco", recoRoutes);
app.use("/log", userLogRoutes);
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/tracking", trackingRoutes);
app.use("/issue-archives", issueArchiveRoutes);
app.use("/user-log", userLogRoutes);
app.use("/search", searchRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  warmIssuesCache();
  setInterval(warmIssuesCache, 15000);
});
