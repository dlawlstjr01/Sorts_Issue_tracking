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

// 쿠키 또는 Authorization 헤더(Bearer)에서 JWT 추출
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

// /auth/me 전용: 토큰 없거나 만료면 익명으로 통과
exports.optionalVerifyToken = (req, res, next) => {
  try {
    const bearer =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null;

    const token = req.cookies?.accessToken || bearer;
    // 토큰이 없으면 미로그인 상태로 통과
    if (!token) {
      req.user = null;
      return next();
    }

    // 토큰이 있으면 검증
    const decoded = authService.verifyToken(token);
    req.user = { userId: decoded.userId, loginId: decoded.loginId };
    return next();
  } catch (err) {
    // 토큰 만료/위조여도 /me에서는 401 금지 -> 미로그인 처리
    req.user = null;
    return next();
  }
};

exports.me = async (req, res) => {
  try {
    // 미로그인은 200으로 응답해 프론트 분기 단순화
    if (!req.user?.userId) {
      return res.status(200).json({ id: null });
      // 또는: return res.sendStatus(204);
    }
    const me = await authService.getMe(req.user.userId);
    return res.json(me);
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "유저 조회 실패" });
  }
};

exports.logout = (req, res) => {
  const opts = authService.getCookieOptions();
  res.clearCookie("accessToken", opts);
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
    // 아이디 찾기 결과는 프론트 모달에서 표시한다.
    const login_id = await authService.findLoginId({ name, phone });
    return res.status(200).json({ login_id });
  } catch (err) {
    const code = err.statusCode || 400;
    return res.status(code).json({ message: err.message || "아이디 찾기 실패" });
  }
};

exports.passwordResetRequest = async (req, res) => {
  try {
    const { login_id, email, phone, method } = req.body;
    // 이메일 기본 + 휴대폰 보조 복구 정책은 서비스 레이어에서 통합 처리한다.
    const result = await authService.requestPasswordReset({ login_id, email, phone, method });
    const message =
      result.method === "phone" ? "인증코드를 문자로 전송했습니다." : "인증코드를 이메일로 전송했습니다.";

    const payload = {
      message,
      channel: result.channel,
      delivered: !!result.delivered,
      method: result.method,
    };

    // 개발 환경 fallback(실제 발송 미연동)에서만 디버그 코드를 반환한다.
    if (result.debugCode) payload.debugCode = result.debugCode;
    return res.status(200).json(payload);
  } catch (err) {
    const code = err.statusCode || 400;
    return res.status(code).json({ message: err.message || "재설정 요청 실패" });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    const { login_id, email, phone, method, code, newPassword } = req.body;
    // 선택한 복구 채널(email/phone) 기준으로 인증코드를 검증한 뒤 비밀번호를 변경한다.
    await authService.resetPassword({ login_id, email, phone, method, code, newPassword });
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
    const { name, email, phone, birth_date } = req.body;

    const user = await authService.updateMe(userId, { name, email, phone, birth_date });
    return res.status(200).json({
      message: "저장 완료",
      user,
    });
  } catch (err) {
    const code = err.statusCode || 400;
    return res.status(code).json({
      message: err.message || "저장 실패",
    });
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
