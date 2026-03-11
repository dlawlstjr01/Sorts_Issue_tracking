function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function assertEmail(email) {
  // 팀원이 규칙을 바꾸기 쉽도록 이메일 형식 검증을 한 곳에 모아둔다.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const err = new Error("이메일 형식이 올바르지 않습니다.");
    err.statusCode = 400;
    throw err;
  }
}

function hasSmtpConfig() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS &&
    !!process.env.EMAIL_FROM
  );
}

function parseSecureFlag() {
  if (typeof process.env.SMTP_SECURE === "string") {
    return process.env.SMTP_SECURE.toLowerCase() === "true";
  }
  return Number(process.env.SMTP_PORT) === 465;
}

async function sendViaSmtp({ to, subject, text, html }) {
  let nodemailer;
  try {
    // nodemailer는 SMTP 설정이 실제로 있을 때만 동적으로 로드한다.
    nodemailer = require("nodemailer");
  } catch (loadErr) {
    const err = new Error("nodemailer 모듈이 없어 이메일 전송을 사용할 수 없습니다. npm install nodemailer 후 재시도해주세요.");
    err.statusCode = 500;
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: parseSecureFlag(),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

function isDevFallbackEnabled() {
  const flag = String(process.env.EMAIL_ALLOW_DEV_FALLBACK || "true").toLowerCase();
  return process.env.NODE_ENV !== "production" && flag === "true";
}

async function sendEmail({ to, subject, text, html }) {
  const email = normalizeEmail(to);
  assertEmail(email);

  if (hasSmtpConfig()) {
    await sendViaSmtp({ to: email, subject, text, html });
    return { delivered: true, channel: "email" };
  }

  if (isDevFallbackEnabled()) {
    // 개발 환경에서는 인증코드를 로그로만 출력해도 플로우를 검증할 수 있다.
    console.log(`[email:dev-fallback] to=${email} subject="${subject}" text="${text}"`);
    return { delivered: false, channel: "dev-fallback" };
  }

  const err = new Error("이메일 발송 설정이 되어 있지 않습니다.");
  err.statusCode = 500;
  throw err;
}

exports.normalizeEmail = normalizeEmail;
exports.sendPasswordResetCode = async ({ email, code }) => {
  const subject = "[NEWS ISSUE TRACKER] 비밀번호 재설정 인증코드";
  const text = `비밀번호 재설정 인증코드는 ${code} 입니다. 본인이 요청하지 않았다면 이 메일을 무시해주세요.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p><strong>NEWS ISSUE TRACKER</strong> 비밀번호 재설정 안내</p>
      <p>인증코드는 <strong style="font-size: 18px;">${code}</strong> 입니다.</p>
      <p>본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};
