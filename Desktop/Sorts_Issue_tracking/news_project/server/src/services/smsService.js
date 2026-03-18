const axios = require("axios");
const crypto = require("crypto");

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("82") && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

function assertKoreanMobile(phone) {
  if (!/^01\d{8,9}$/.test(phone)) {
    const err = new Error("휴대폰 번호 형식이 올바르지 않습니다.");
    err.statusCode = 400;
    throw err;
  }
}

function createNcpSignature({ method, url, timestamp, accessKey, secretKey }) {
  const message = `${method} ${url}\n${timestamp}\n${accessKey}`;
  return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
}

function hasNcpConfig() {
  return (
    !!process.env.NCP_SMS_ACCESS_KEY &&
    !!process.env.NCP_SMS_SECRET_KEY &&
    !!process.env.NCP_SMS_SERVICE_ID &&
    !!process.env.NCP_SMS_FROM
  );
}

async function sendViaNcp({ to, content }) {
  const serviceId = process.env.NCP_SMS_SERVICE_ID;
  const accessKey = process.env.NCP_SMS_ACCESS_KEY;
  const secretKey = process.env.NCP_SMS_SECRET_KEY;
  const from = normalizePhone(process.env.NCP_SMS_FROM);

  const timestamp = String(Date.now());
  const method = "POST";
  const url = `/sms/v2/services/${serviceId}/messages`;
  const signature = createNcpSignature({ method, url, timestamp, accessKey, secretKey });

  const endpoint = `https://sens.apigw.ntruss.com${url}`;
  const payload = {
    type: "SMS",
    contentType: "COMM",
    countryCode: "82",
    from,
    content,
    messages: [{ to, content }],
  };

  await axios.post(endpoint, payload, {
    timeout: 10000,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-ncp-apigw-timestamp": timestamp,
      "x-ncp-iam-access-key": accessKey,
      "x-ncp-apigw-signature-v2": signature,
    },
  });
}

function isDevFallbackEnabled() {
  const flag = String(process.env.SMS_ALLOW_DEV_FALLBACK || "true").toLowerCase();
  return process.env.NODE_ENV !== "production" && flag === "true";
}

async function sendSms({ to, content }) {
  const phone = normalizePhone(to);
  assertKoreanMobile(phone);

  if (hasNcpConfig()) {
    await sendViaNcp({ to: phone, content });
    return { delivered: true, channel: "sms" };
  }

  if (isDevFallbackEnabled()) {
    // 개발 환경에서는 인증코드를 서버 로그로만 출력한다.
    console.log(`[sms:dev-fallback] to=${phone} content="${content}"`);
    return { delivered: false, channel: "dev-fallback" };
  }

  const err = new Error("SMS 발송 설정이 되어 있지 않습니다.");
  err.statusCode = 500;
  throw err;
}

exports.normalizePhone = normalizePhone;
exports.sendPasswordResetCode = async ({ phone, code }) => {
  const content = `[NEWS ISSUE TRACKER] 비밀번호 재설정 인증번호는 ${code} 입니다.`;
  return sendSms({ to: phone, content });
};
