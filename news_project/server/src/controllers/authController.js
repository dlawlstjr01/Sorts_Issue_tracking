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

    // JWT를 HttpOnly 쿠키로 저장
    res.cookie("accessToken", token, authService.getCookieOptions());

    return res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    const code = err.statusCode || 401;
    return res.status(code).json({ message: err.message || "로그인 실패" });
  }
};

// 쿠키 또는 Authorization 헤더(Bearer) 둘 다 지원
exports.verifyToken = (req, res, next) => {
  try {
    const bearer =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null;

    const token = req.cookies?.accessToken || bearer;

    const decoded = authService.verifyToken(token);
    req.user = { userId: decoded.userId, loginId: decoded.loginId };
    return next();
  } catch (err) {
    return res.status(401).json({ message: err.message || "유효하지 않은 토큰" });
  }
};

exports.me = async (req, res) => {
  try {
    const me = await authService.getMe(req.user.userId);
    return res.json(me);
  } catch (err) {
    const code = err.statusCode || 401;
    return res.status(code).json({ message: err.message || "유저 없음" });
  }
};

exports.logout = (req, res) => {
  // setCookie 할 때 옵션과 최대한 동일하게 clear
  res.clearCookie("accessToken", authService.getClearCookieOptions());
  return res.status(200).json({ message: "로그아웃 완료" });
};

exports.googleCallback = async (req, res) => {
  try {
    const { provider, sns_id, sns_email } = req.user;

    const user = await authService.upsertSocialUser({ provider, sns_id, sns_email });
    const token = authService.signToken({
      userId: user.id,
      loginId: user.login_id || null,
    });

    res.cookie("accessToken", token, authService.getCookieOptions());

    // 프론트 첫 화면으로 (원하면 /?view=home 이런식으로 바꿔도 됨)
    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    return res.redirect(`${origin}/`);
  } catch (e) {
    console.error("googleCallback error:", e);
    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    return res.redirect(`${origin}/?view=login`);
  }
};

exports.kakaoCallback = async (req, res) => {
  try {
    const { provider, sns_id, sns_email } = req.user;

    const user = await authService.upsertSocialUser({ provider, sns_id, sns_email });
    const token = authService.signToken({
      userId: user.id,
      loginId: user.login_id || null,
    });

    res.cookie("accessToken", token, authService.getCookieOptions());

    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    return res.redirect(`${origin}/`);
  } catch (e) {
    console.error("kakaoCallback error:", e);
    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    return res.redirect(`${origin}/?view=login`);
  }
};

exports.findId = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const login_id = await authService.findLoginId({ name, phone });
    return res.status(200).json({ login_id });
  } catch (err) {
    const code = err.statusCode || 400;
    return res.status(code).json({ message: err.message || "아이디 찾기 실패" });
  }
};

exports.passwordResetRequest = async (req, res) => {
  try {
    const { login_id, email } = req.body;
    const result = await authService.requestPasswordReset({ login_id, email });

    // 메일 연동 전까지 code 내려줌
    return res.status(200).json({
      message: "인증코드를 전송했습니다.",
      code: result.code,
    });
  } catch (err) {
    const code = err.statusCode || 400;
    return res.status(code).json({ message: err.message || "재설정 요청 실패" });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    const { login_id, email, code, newPassword } = req.body;
    await authService.resetPassword({ login_id, email, code, newPassword });
    return res.status(200).json({ message: "비밀번호 변경 완료" });
  } catch (err) {
    const codeStatus = err.statusCode || 400;
    return res.status(codeStatus).json({ message: err.message || "비밀번호 변경 실패" });
  }
};

exports.checkLoginId = async (req, res) => {
  try {
    const { login_id } = req.query;

    if (!login_id || !String(login_id).trim()) {
      return res.status(400).json({ message: "login_id가 필요합니다." });
    }

    const exists = await authService.isLoginIdTaken(String(login_id).trim());
    return res.status(200).json({
      available: !exists,
      message: exists ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.",
    });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "중복확인 실패" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email, phone } = req.body;

    const user = await authService.updateMe(userId, { email, phone });
    return res.status(200).json({ message: "저장 완료", user });
  } catch (err) {
    const code = err.statusCode || 400;
    return res.status(code).json({ message: err.message || "저장 실패" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, { currentPassword, newPassword });
    return res.status(200).json({ message: "비밀번호 변경 완료" });
  } catch (err) {
    const code = err.statusCode || 400;
    return res.status(code).json({ message: err.message || "비밀번호 변경 실패" });
  }
};