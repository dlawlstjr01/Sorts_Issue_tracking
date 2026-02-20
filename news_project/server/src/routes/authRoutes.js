const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authController.verifyToken, authController.me);
router.post("/logout", authController.logout);


//  Google 소셜 로그인 시작
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

//  Google 콜백
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_ORIGIN}/auth/login` }),
  authController.googleCallback
);

//  카카오 로그인 시작
router.get(
  "/kakao",
  passport.authenticate("kakao", { session: false })
);

//  카카오 콜백
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false,
    failureRedirect: `${process.env.CLIENT_ORIGIN}/auth/login`,
  }),
  authController.kakaoCallback
);


module.exports = router;
