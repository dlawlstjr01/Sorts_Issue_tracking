const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authController.verifyToken, authController.me);
router.put("/me", authController.verifyToken, authController.updateMe);
router.post("/logout", authController.logout);
router.post("/find-id", authController.findId);
router.post("/password/reset-request", authController.passwordResetRequest);
router.post("/password/reset", authController.passwordReset);
router.post("/password/change", authController.verifyToken, authController.changePassword);
router.get("/check-login-id", authController.checkLoginId);

// Google 소셜 로그인 시작
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Google 콜백
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/?view=login`,
  }),
  authController.googleCallback
);

// 카카오 로그인 시작
router.get("/kakao", passport.authenticate("kakao", { session: false }));

// 카카오 콜백
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false,
    failureRedirect: `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/?view=login`,
  }),
  authController.kakaoCallback
);

module.exports = router;