const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/DB");
const smsService = require("./smsService");
const emailService = require("./emailService");

// 간단한 에러 객체(status 포함)
function makeError(message, statusCode) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

// 전화번호 정규화
const normalizePhone = (value) => smsService.normalizePhone(value);
const normalizeEmail = (value) => emailService.normalizeEmail(value);
// DB 전화번호 비교 시 구분자(-, 공백, .) 무시
const PHONE_SQL = `REPLACE(REPLACE(REPLACE(IFNULL(phone, ''), '-', ''), ' ', ''), '.', '')`;
const RESET_METHOD = {
  EMAIL: "email",
  PHONE: "phone",
};

function normalizeResetMethod(method) {
  const methodT = String(method || RESET_METHOD.EMAIL).trim().toLowerCase();
  return methodT === RESET_METHOD.PHONE ? RESET_METHOD.PHONE : RESET_METHOD.EMAIL;
}

function resolveResetMethod({ method, email, phone }) {
  const normalizedMethod = String(method || "").trim().toLowerCase();
  if (normalizedMethod === RESET_METHOD.EMAIL || normalizedMethod === RESET_METHOD.PHONE) {
    return normalizedMethod;
  }

  // 기존 phone-only 클라이언트와의 호환을 위해 method 미지정 시 입력값으로 추론한다.
  const emailT = normalizeEmail(email);
  const phoneN = normalizePhone(phone);
  if (!emailT && phoneN) return RESET_METHOD.PHONE;
  return normalizeResetMethod(normalizedMethod);
}

function assertResetMethodInputs({ method, email, phone }) {
  const emailT = normalizeEmail(email);
  const phoneN = normalizePhone(phone);

  // 비밀번호 재설정은 이메일을 기본으로 하고, 필요 시 휴대폰 보조 복구를 허용한다.
  if (method === RESET_METHOD.EMAIL) {
    if (!emailT) throw makeError("이메일을 입력해주세요.", 400);
  } else if (!phoneN) {
    throw makeError("휴대폰 번호를 입력해주세요.", 400);
  }

  return { emailT, phoneN };
}

async function getResetUserByMethod({ login_id, method, email, phone }) {
  const loginIdT = String(login_id || "").trim();
  if (!loginIdT) throw makeError("아이디를 입력해주세요.", 400);

  const { emailT, phoneN } = assertResetMethodInputs({ method, email, phone });

  const [rows] = await db.query(
    `
    SELECT id, email, phone
    FROM users
    WHERE login_id = ?
    LIMIT 1
    `,
    [loginIdT]
  );

  if (!rows.length) throw makeError("입력한 계정 정보를 찾을 수 없습니다.", 404);

  const user = rows[0];
  const savedEmail = normalizeEmail(user.email);
  const savedPhone = normalizePhone(user.phone);

  if (method === RESET_METHOD.EMAIL) {
    if (!savedEmail || savedEmail !== emailT) {
      throw makeError("아이디와 이메일이 일치하지 않습니다.", 404);
    }
    return { userId: user.id, method, email: savedEmail, phone: savedPhone };
  }

  if (!savedPhone || savedPhone !== phoneN) {
    throw makeError("아이디와 휴대폰 번호가 일치하지 않습니다.", 404);
  }
  return { userId: user.id, method, email: savedEmail, phone: savedPhone };
}

// 로그인 쿠키 옵션
exports.getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 60,
    path: "/",
  };
};

// 로그아웃 clearCookie 옵션 (maxAge 없음)
exports.getClearCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
};

// 회원가입(local)
exports.signup = async ({ login_id, password, name, email, phone, birth_date, age_group, gender }) => {
  const loginIdT = String(login_id || "").trim();
  const nameT = String(name || "").trim();
  const emailT = String(email || "").trim();
  const phoneN = normalizePhone(phone);
  const birthT = String(birth_date || "").trim();

  if (!loginIdT || !password || !emailT || !nameT) {
    throw makeError("login_id / password / name / email은 필수입니다.", 400);
  }
  // birth_date 형식 간단 검증 (YYYY-MM-DD 권장)
  if (birthT && !/^\d{4}-\d{2}-\d{2}$/.test(birthT)) {
    throw makeError("birth_date 형식은 YYYY-MM-DD 이어야 합니다.", 400);
  }

  const [dupLogin] = await db.query(`SELECT id FROM users WHERE login_id = ? LIMIT 1`, [loginIdT]);
  if (dupLogin.length) throw makeError("이미 사용 중인 login_id 입니다.", 409);

  const [dupEmail] = await db.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [emailT]);
  if (dupEmail.length) throw makeError("이미 사용 중인 email 입니다.", 409);

  if (phoneN) {
    const [dupPhone] = await db.query(`SELECT id FROM users WHERE ${PHONE_SQL} = ? LIMIT 1`, [phoneN]);
    if (dupPhone.length) throw makeError("이미 사용 중인 휴대폰 번호입니다.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await db.query(
    `
    INSERT INTO users (login_id, password, name, email, phone, birth_date, age_group, gender, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [loginIdT, passwordHash, nameT, emailT, phoneN || null, birthT || null, age_group || null, gender || null]
  );

  return {
    id: result.insertId,
    login_id: loginIdT,
    name: nameT,
    email: emailT,
    phone: phoneN || null,
    birth_date: birthT || null,
    age_group: age_group || null,
    gender: gender || null,
  };
};

// 로그인(local)
exports.login = async ({ login_id, password }) => {
  const loginIdT = String(login_id || "").trim();
  if (!loginIdT || !password) throw makeError("아이디 또는 비밀번호가 누락되었습니다.", 400);

  const [rows] = await db.query(
    `
    SELECT id, login_id, password
    FROM users
    WHERE login_id = ?
    LIMIT 1
    `,
    [loginIdT]
  );

  if (!rows.length) throw makeError("존재하지 않는 아이디입니다.", 401);

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw makeError("비밀번호가 일치하지 않습니다.", 401);

  return exports.signToken({ userId: user.id, loginId: user.login_id });
};

// JWT 검증
exports.verifyToken = (token) => {
  if (!token) throw makeError("로그인이 필요합니다.", 401);
  return jwt.verify(token, process.env.JWT_SECRET);
};

// 내 정보 조회
exports.getMe = async (userId) => {
  const [rows] = await db.query(
    `
    SELECT id, login_id, name, email, phone, birth_date, age_group, gender, created_at,
           sns_email, provider, sns_id
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length) throw makeError("유저를 찾을 수 없습니다.", 401);

  const u = rows[0];
  return {
    id: u.id,
    login_id: u.login_id,
    name: u.name,
    email: u.email,
    phone: u.phone || null,
    birth_date: u.birth_date || null,
    age_group: u.age_group,
    gender: u.gender,
    created_at: u.created_at,
    sns_email: u.sns_email || null,
    provider: u.provider || null,
    sns_id: u.sns_id || null,
  };
};

// JWT 발급
exports.signToken = ({ userId, loginId }) => {
  return jwt.sign({ userId, loginId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 소셜 로그인용 upsert
exports.upsertSocialUser = async ({ provider, sns_id, sns_email }) => {
  const socialId = String(sns_id);
  const fallbackEmail = `${provider}_${socialId}@social.local`;
  if (!provider || !sns_id) throw makeError("소셜 정보(provider/sns_id)가 누락되었습니다.", 400);

  // 1) provider + sns_id로 기존 계정 찾기
  const [found] = await db.query(
    `
    SELECT id, login_id, email, sns_email, provider, sns_id
    FROM users
    WHERE provider = ? AND sns_id = ?
    LIMIT 1
    `,
    [provider, socialId]
  );

  if (found.length) {
    const user = found[0];
    // 소셜 이메일이 변경되어 있으면 최신값으로 갱신
    if (sns_email && user.sns_email !== sns_email) {
      const shouldSyncLoginEmail = !user.email || user.email === fallbackEmail;
      if (shouldSyncLoginEmail) {
        await db.query(`UPDATE users SET email = ?, sns_email = ? WHERE id = ?`, [sns_email, sns_email, user.id]);
        user.email = sns_email;
      } else {
        await db.query(`UPDATE users SET sns_email = ? WHERE id = ?`, [sns_email, user.id]);
      }
      user.sns_email = sns_email;
    }
    return user;
  }

  // 2) 신규 소셜 계정 생성
  if (!sns_email && process.env.REQUIRE_SOCIAL_EMAIL === "true") {
    throw makeError("소셜 이메일을 받지 못했습니다. 이메일 동의가 필요합니다.", 400);
  }

  const dummyPasswordHash = await bcrypt.hash(`SOCIAL_${provider}_${sns_id}_${Date.now()}`, 12);
  const [result] = await db.query(
    `
    INSERT INTO users (login_id, password, name, email, phone, sns_email, provider, sns_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [null, dummyPasswordHash, null, sns_email || fallbackEmail, null, sns_email, provider, socialId]
  );

  return {
    id: result.insertId,
    login_id: null,
    email: sns_email || fallbackEmail,
    phone: null,
    sns_email: sns_email || null,
    provider,
    sns_id: socialId,
  };
};

// 아이디 찾기: 이름 + 휴대폰 번호로 login_id 조회
exports.findLoginId = async ({ name, phone }) => {
  const nameT = String(name || "").trim();
  const phoneN = normalizePhone(phone);

  if (!nameT) throw makeError("이름이 필요합니다.", 400);
  if (!phoneN) throw makeError("휴대폰 번호가 필요합니다.", 400);

  const [rows] = await db.query(
    `
    SELECT login_id
    FROM users
    WHERE name = ?
      AND ${PHONE_SQL} = ?
    LIMIT 1
    `,
    [nameT, phoneN]
  );

  if (!rows.length) throw makeError("일치하는 계정을 찾을 수 없습니다.", 404);
  if (!rows[0].login_id) throw makeError("소셜 계정은 소셜 로그인으로 이용해주세요.", 400);

  return rows[0].login_id;
};

// 비밀번호 재설정 요청: code 발급 + DB 저장(10분 유효)
exports.requestPasswordReset = async ({ login_id, email, phone, method }) => {
  const resetMethod = resolveResetMethod({ method, email, phone });
  const resetUser = await getResetUserByMethod({ login_id, method: resetMethod, email, phone });
  const code = String(Math.floor(100000 + Math.random() * 900000));

  // 채널을 바꿔 재요청할 때 이전 코드를 반드시 지워 혼선을 방지한다.
  await db.query(`DELETE FROM password_reset_codes WHERE user_id = ?`, [resetUser.userId]);
  await db.query(
    `
    INSERT INTO password_reset_codes (user_id, code, expires_at, created_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW())
    `,
    [resetUser.userId, code]
  );

  let delivery;
  if (resetMethod === RESET_METHOD.EMAIL) {
    delivery = await emailService.sendPasswordResetCode({ email: resetUser.email, code });
  } else {
    delivery = await smsService.sendPasswordResetCode({ phone: resetUser.phone, code });
  }

  return {
    delivered: !!delivery?.delivered,
    channel: delivery?.channel || "unknown",
    method: resetMethod,
    debugCode: delivery?.channel === "dev-fallback" ? code : undefined,
  };
};

// 비밀번호 재설정: code 검증 후 비번 업데이트
exports.resetPassword = async ({ login_id, email, phone, method, code, newPassword }) => {
  const resetMethod = resolveResetMethod({ method, email, phone });
  const codeT = String(code || "").trim();

  if (!codeT || !newPassword) {
    throw makeError("code / newPassword는 필수입니다.", 400);
  }
  if (String(newPassword).length < 4) {
    throw makeError("비밀번호는 4자 이상이어야 합니다.", 400);
  }

  const resetUser = await getResetUserByMethod({ login_id, method: resetMethod, email, phone });
  const userId = resetUser.userId;
  const [crows] = await db.query(
    `
    SELECT code, expires_at
    FROM password_reset_codes
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!crows.length) throw makeError("먼저 인증코드를 요청해주세요.", 400);
  if (String(crows[0].code) !== codeT) throw makeError("인증코드가 올바르지 않습니다.", 400);

  // 만료 체크
  const [exp] = await db.query(
    `SELECT (expires_at < NOW()) AS expired FROM password_reset_codes WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (exp?.[0]?.expired) throw makeError("인증코드가 만료되었습니다. 다시 요청해주세요.", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.query(`UPDATE users SET password = ? WHERE id = ?`, [passwordHash, userId]);
  // 사용한 코드는 제거
  await db.query(`DELETE FROM password_reset_codes WHERE user_id = ?`, [userId]);
  return true;
};

// 중복확인
exports.isLoginIdTaken = async (login_id) => {
  const loginIdT = String(login_id || "").trim();
  if (!loginIdT) return false;
  const [rows] = await db.query(`SELECT id FROM users WHERE login_id = ? LIMIT 1`, [loginIdT]);
  return rows.length > 0;
};

// 마이페이지 기본 정보 수정
exports.updateMe = async (userId, { name, email, phone, birth_date }) => {
  if (!userId) throw makeError("유저를 찾을 수 없습니다.", 401);

  const nameT = String(name || "").trim();
  const emailT = String(email || "").trim();
  const phoneN = normalizePhone(phone);
  const birthT = String(birth_date || "").trim();

  if (!nameT) throw makeError("이름이 필요합니다.", 400);
  if (!emailT) throw makeError("이메일이 필요합니다.", 400);
  if (!phoneN) throw makeError("휴대폰 번호가 필요합니다.", 400);
  // birth_date 검증
  if (birthT && !/^\d{4}-\d{2}-\d{2}$/.test(birthT)) {
    throw makeError("생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)", 400);
  }

  // 이메일 중복 체크 (본인 제외)
  const [dupEmail] = await db.query(
    `SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1`,
    [emailT, userId]
  );
  if (dupEmail.length) throw makeError("이미 사용 중인 email 입니다.", 409);

  // 휴대폰 중복 체크 (본인 제외)
  const [dupPhone] = await db.query(
    `SELECT id FROM users WHERE ${PHONE_SQL} = ? AND id <> ? LIMIT 1`,
    [phoneN, userId]
  );
  if (dupPhone.length) throw makeError("이미 사용 중인 휴대폰 번호입니다.", 409);

  await db.query(
    `UPDATE users SET name = ?, email = ?, phone = ?, birth_date = ? WHERE id = ?`,
    [nameT, emailT, phoneN, birthT || null, userId]
  );

  return exports.getMe(userId);
};

// 로그인 상태에서 비밀번호 변경
exports.changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!userId) throw makeError("유저를 찾을 수 없습니다.", 401);
  if (!currentPassword || !newPassword) throw makeError("비밀번호 입력이 필요합니다.", 400);
  if (String(newPassword).length < 4) throw makeError("새 비밀번호는 4자 이상이어야 합니다.", 400);

  const [rows] = await db.query(`SELECT id, password FROM users WHERE id = ? LIMIT 1`, [userId]);
  if (!rows.length) throw makeError("유저를 찾을 수 없습니다.", 401);

  const ok = await bcrypt.compare(currentPassword, rows[0].password);
  if (!ok) throw makeError("현재 비밀번호가 올바르지 않습니다.", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.query(`UPDATE users SET password = ? WHERE id = ?`, [passwordHash, userId]);
  return true;
};
