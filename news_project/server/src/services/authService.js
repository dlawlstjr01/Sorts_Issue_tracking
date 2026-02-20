const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/DB");

exports.getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 60, // 1h
    path: "/",
  };
};

// 로그아웃 시 clearCookie용 (maxAge 없이)
exports.getClearCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
};

// 간단한 에러 객체(status 포함)
function makeError(message, statusCode) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

// 회원가입 (local)
exports.signup = async ({ login_id, password, email, phone, age_group, gender }) => {
  if (!login_id || !password || !email) {
    throw makeError("login_id / password / email 필수", 400);
  }

  // 중복 체크
  const [dup1] = await db.query(
    `SELECT id FROM users WHERE login_id = ? LIMIT 1`,
    [login_id]
  );
  if (dup1.length) throw makeError("이미 사용 중인 login_id 입니다.", 409);

  const [dup2] = await db.query(
    `SELECT id FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  if (dup2.length) throw makeError("이미 사용 중인 email 입니다.", 409);

  if (phone) {
    const [dup3] = await db.query(
      `SELECT id FROM users WHERE phone = ? LIMIT 1`,
      [phone]
    );
    if (dup3.length) throw makeError("이미 사용 중인 휴대폰 번호입니다.", 409);
  }

  // 비밀번호 해싱
  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await db.query(
    `
    INSERT INTO users (login_id, password, email, phone, age_group, gender, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [login_id, passwordHash, email, phone || null, age_group || null, gender || null]
  );

  return {
    id: result.insertId,
    login_id,
    email,
    phone: phone || null,
    age_group: age_group || null,
    gender: gender || null,
  };
};

// 로그인 (local)
exports.login = async ({ login_id, password }) => {
  if (!login_id || !password) throw makeError("아이디 또는 비밀번호 누락", 400);

  const [rows] = await db.query(
    `
    SELECT id, login_id, password
    FROM users
    WHERE login_id = ?
    `,
    [login_id]
  );

  if (!rows.length) throw makeError("존재하지 않는 아이디", 401);

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw makeError("비밀번호 불일치", 401);

  return exports.signToken({ userId: user.id, loginId: user.login_id });
};

exports.verifyToken = (token) => {
  if (!token) throw makeError("토큰 없음", 401);
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.getMe = async (userId) => {
  const [rows] = await db.query(
    `
    SELECT id, login_id, email, phone, age_group, gender, created_at, sns_email, provider, sns_id
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  if (!rows.length) throw makeError("유저 없음", 401);

  const u = rows[0];
  return {
    id: u.id,
    login_id: u.login_id,
    email: u.email,
    phone: u.phone || null,
    age_group: u.age_group,
    gender: u.gender,
    created_at: u.created_at,
    // 소셜 관련(있으면 내려줌)
    sns_email: u.sns_email || null,
    provider: u.provider || null,
    sns_id: u.sns_id || null,
  };
};

exports.signToken = ({ userId, loginId }) => {
  return jwt.sign({ userId, loginId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 소셜 로그인용 upsert
exports.upsertSocialUser = async ({ provider, sns_id, sns_email }) => {
  if (!provider || !sns_id) throw makeError("소셜 정보 누락(provider/sns_id)", 400);

  // 1) provider + sns_id로 찾기
  let [found] = await db.query(
    `
    SELECT id, login_id, email, sns_email, provider, sns_id
    FROM users
    WHERE provider = ? AND sns_id = ?
    LIMIT 1
    `,
    [provider, String(sns_id)]
  );

  if (found.length) {
    const user = found[0];

    // 이메일이 들어오면 업데이트
    if (sns_email && user.sns_email !== sns_email) {
      await db.query(`UPDATE users SET sns_email = ? WHERE id = ?`, [sns_email, user.id]);
      user.sns_email = sns_email;
    }

    return user;
  }

  // 2) 신규 생성
  if (!sns_email) {
    throw makeError("소셜 이메일을 받지 못했습니다. (이메일 동의 필요)", 400);
  }

  const dummyPasswordHash = await bcrypt.hash(
    `SOCIAL_${provider}_${sns_id}_${Date.now()}`,
    12
  );

  const [result] = await db.query(
    `
    INSERT INTO users (login_id, password, email, phone, sns_email, provider, sns_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      null,                 // login_id
      dummyPasswordHash,     // password (NN 대비)
      sns_email,             // email (NN 대비)
      null,                 //  phone (소셜은 기본 null)
      sns_email,             // sns_email
      provider,
      String(sns_id),
    ]
  );

  return {
    id: result.insertId,
    login_id: null,
    email: sns_email,
    phone: null,
    sns_email,
    provider,
    sns_id: String(sns_id),
  };
};

// 아이디 찾기: 현재 users에 name 컬럼 없으면 phone으로만 찾음(개발용)
exports.findLoginId = async ({ name, phone }) => {
  if (!phone) throw makeError("휴대폰 번호가 필요합니다.", 400);

  const phoneN = String(phone).replace(/\D/g, "");
  if (!phoneN) throw makeError("휴대폰 번호 형식이 올바르지 않습니다.", 400);

  const [rows] = await db.query(
    `
    SELECT login_id
    FROM users
    WHERE phone = ?
    LIMIT 1
    `,
    [phoneN]
  );

  if (!rows.length) throw makeError("일치하는 계정을 찾을 수 없습니다.", 404);
  if (!rows[0].login_id) throw makeError("해당 계정은 소셜 계정입니다. 소셜 로그인을 이용하세요.", 400);

  return rows[0].login_id;
};

// 비밀번호 재설정 요청: code 발급 + DB 저장 (10분 유효)
exports.requestPasswordReset = async ({ login_id, email }) => {
  if (!login_id || !email) throw makeError("login_id / email 필수", 400);

  const [rows] = await db.query(
    `
    SELECT id, login_id, email
    FROM users
    WHERE login_id = ? AND email = ?
    LIMIT 1
    `,
    [login_id, email]
  );

  if (!rows.length) throw makeError("아이디/이메일이 일치하지 않습니다.", 404);

  const userId = rows[0].id;

  // 6자리 코드
  const code = String(Math.floor(100000 + Math.random() * 900000));

  // 기존 코드 무효화
  await db.query(`DELETE FROM password_reset_codes WHERE user_id = ?`, [userId]);

  // 10분 만료
  await db.query(
    `
    INSERT INTO password_reset_codes (user_id, code, expires_at, created_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW())
    `,
    [userId, code]
  );

  // TODO: 실제 메일 발송 연동 시 여기서 email로 발송
  return { code };
};

// 비밀번호 재설정: code 검증 후 비번 업데이트
exports.resetPassword = async ({ login_id, email, code, newPassword }) => {
  if (!login_id || !email || !code || !newPassword) {
    throw makeError("login_id / email / code / newPassword 필수", 400);
  }
  if (String(newPassword).length < 8) throw makeError("비밀번호는 8자 이상이어야 합니다.", 400);

  const [urows] = await db.query(
    `
    SELECT id
    FROM users
    WHERE login_id = ? AND email = ?
    LIMIT 1
    `,
    [login_id, email]
  );
  if (!urows.length) throw makeError("아이디/이메일이 일치하지 않습니다.", 404);

  const userId = urows[0].id;

  const [crows] = await db.query(
    `
    SELECT code, expires_at
    FROM password_reset_codes
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!crows.length) throw makeError("인증코드를 먼저 요청해주세요.", 400);

  const row = crows[0];
  if (String(row.code) !== String(code)) throw makeError("인증코드가 올바르지 않습니다.", 400);

  // 만료 체크
  const [exp] = await db.query(
    `SELECT (expires_at < NOW()) AS expired FROM password_reset_codes WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (exp?.[0]?.expired) throw makeError("인증코드가 만료되었습니다. 다시 요청해주세요.", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.query(`UPDATE users SET password = ? WHERE id = ?`, [passwordHash, userId]);

  // 사용한 코드 삭제
  await db.query(`DELETE FROM password_reset_codes WHERE user_id = ?`, [userId]);

  return true;
};

// 중복확인
exports.isLoginIdTaken = async (login_id) => {
  const [rows] = await db.query(
    `SELECT id FROM users WHERE login_id = ? LIMIT 1`,
    [login_id]
  );
  return rows.length > 0;
};

exports.updateMe = async (userId, { email, phone }) => {
  if (!userId) throw makeError("유저 없음", 401);

  const emailT = String(email || "").trim();
  const phoneN = String(phone || "").replace(/\D/g, "");

  if (!emailT) throw makeError("이메일이 필요합니다.", 400);
  if (!phoneN) throw makeError("휴대폰 번호가 필요합니다.", 400);

  // 이메일 중복 체크 (본인 제외)
  const [dupEmail] = await db.query(
    `SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1`,
    [emailT, userId]
  );
  if (dupEmail.length) throw makeError("이미 사용 중인 email 입니다.", 409);

  // 휴대폰 중복 체크 (본인 제외)
  const [dupPhone] = await db.query(
    `SELECT id FROM users WHERE phone = ? AND id <> ? LIMIT 1`,
    [phoneN, userId]
  );
  if (dupPhone.length) throw makeError("이미 사용 중인 휴대폰 번호입니다.", 409);

  await db.query(
    `UPDATE users SET email = ?, phone = ? WHERE id = ?`,
    [emailT, phoneN, userId]
  );

  // 최신 정보 반환
  return exports.getMe(userId);
};

exports.changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!userId) throw makeError("유저 없음", 401);
  if (!currentPassword || !newPassword) throw makeError("비밀번호 입력이 필요합니다.", 400);
  if (String(newPassword).length < 8) throw makeError("새 비밀번호는 8자 이상이어야 합니다.", 400);

  const [rows] = await db.query(
    `SELECT id, password FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  if (!rows.length) throw makeError("유저 없음", 401);

  const ok = await bcrypt.compare(currentPassword, rows[0].password);
  if (!ok) throw makeError("현재 비밀번호가 올바르지 않습니다.", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.query(`UPDATE users SET password = ? WHERE id = ?`, [passwordHash, userId]);

  return true;
};