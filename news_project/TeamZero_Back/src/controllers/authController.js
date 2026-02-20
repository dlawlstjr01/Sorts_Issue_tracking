const authService = require("../services/authService");

exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    return res.status(201).json({ message: "회원가입 성공", user });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "회원가입 실패" });
  }
};

exports.login = async (req, res) => {
  try {
    const token = await authService.login(req.body);
    res.cookie("accessToken", token, authService.getCookieOptions());
    return res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    return res.status(401).json({ message: err.message || "로그인 실패" });
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    const decoded = authService.verifyToken(token);
    req.user = { userId: decoded.userId, loginId: decoded.loginId };
    next();
  } catch (err) {
    return res.status(401).json({ message: "유효하지 않은 토큰" });
  }
};

exports.me = async (req, res) => {
  try {
    const me = await authService.getMe(req.user.userId);
    return res.json(me);
  } catch (err) {
    return res.status(401).json({ message: err.message || "유저 없음" });
  }
};

exports.logout = (req, res) => {
  const opts = authService.getCookieOptions();
  res.clearCookie("accessToken", {
    path: opts.path,
    sameSite: opts.sameSite,
    secure: opts.secure,
  });
  return res.status(200).json({ message: "로그아웃 완료" });
};


exports.googleCallback = async (req, res) => {
  try {
    // passport가 req.user에 provider/sns_id/sns_email 넣어줌
    const { provider, sns_id, sns_email } = req.user;

    //  DB에 사용자 없으면 생성, 있으면 가져오기
    const user = await authService.upsertSocialUser({ provider, sns_id, sns_email });
    const token = authService.signToken({ userId: user.id, loginId: user.login_id || null });

    res.cookie("accessToken", token, authService.getCookieOptions());

    // 프론트로 이동 (원하는 페이지로 바꾸세요)
    return res.redirect(`${process.env.CLIENT_ORIGIN}/`);
  } catch (e) {
    console.error(e);
    return res.redirect(`${process.env.CLIENT_ORIGIN}/auth/login`);
  }
};

exports.kakaoCallback = async (req, res) => {
  try {
    const { provider, sns_id, sns_email } = req.user;

    //  DB upsert
    const user = await authService.upsertSocialUser({ provider, sns_id, sns_email });
    const token = authService.signToken({ userId: user.id,  loginId: user.login_id || null});

    res.cookie("accessToken", token, authService.getCookieOptions());

    return res.redirect(`${process.env.CLIENT_ORIGIN}/`);
  } catch (e) {
    console.error("kakaoCallback error:", e);
    return res.redirect(`${process.env.CLIENT_ORIGIN}/auth/login`);
  }
};