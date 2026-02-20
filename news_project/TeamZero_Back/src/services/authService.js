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

exports.signup = async ({ login_id, password, email, age_group, gender }) => {
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

  // 비밀번호 해싱
  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await db.query(
    `
    INSERT INTO users (login_id, password, email, age_group, gender, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
    `,
    [login_id, passwordHash, email, age_group || null, gender || null]
  );

  return {
    id: result.insertId,
    login_id,
    email,
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
    SELECT id, login_id, email, age_group, gender, created_at, sns_email, provider, sns_id
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
    INSERT INTO users (login_id, password, email, sns_email, provider, sns_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      null, // login_id
      dummyPasswordHash, // password (NN 대비)
      sns_email, // email (NN 대비)
      sns_email, // sns_email
      provider,
      String(sns_id),
    ]
  );

  return {
    id: result.insertId,
    login_id: null,
    email: sns_email,
    sns_email,
    provider,
    sns_id: String(sns_id),
  };
};
