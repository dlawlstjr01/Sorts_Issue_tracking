require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const initPassport = require("./config/passport");

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
initPassport();

app.get("/health", (req, res) => res.json({ ok: true }));

//  /auth/login, /auth/me, /auth/logout
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
