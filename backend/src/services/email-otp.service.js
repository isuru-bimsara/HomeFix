const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { EmailOtp } = require("../models");

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 10);
const OTP_RESEND_SECONDS = Number(process.env.OTP_RESEND_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_TRANSPORT || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function createCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function issueOtp(user, purpose, transaction, ignoreCooldown = false) {
  const existing = await EmailOtp.findOne({
    where: { userId: user.id, purpose },
    transaction,
  });

  if (
    existing &&
    !ignoreCooldown &&
    Date.now() - new Date(existing.lastSentAt).getTime() < OTP_RESEND_SECONDS * 1000
  ) {
    const waitSeconds = Math.ceil(
      (OTP_RESEND_SECONDS * 1000 - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000
    );
    const error = new Error(`Please wait ${waitSeconds} seconds before requesting another code.`);
    error.statusCode = 429;
    throw error;
  }

  const code = createCode();
  const values = {
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    attempts: 0,
    lastSentAt: new Date(),
  };

  if (existing) await existing.update(values, { transaction });
  else await EmailOtp.create({ userId: user.id, purpose, ...values }, { transaction });

  const action = purpose === "EMAIL_VERIFICATION" ? "verify your HomeFix account" : "reset your HomeFix password";
  await transporter.sendMail({
    from: `HomeFix <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: user.email,
    subject: purpose === "EMAIL_VERIFICATION" ? "Verify your HomeFix account" : "Reset your HomeFix password",
    text: `Your HomeFix verification code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;background:#eef4f2;border-radius:20px;color:#173a33"><h1 style="margin:0;color:#008568">HomeFix</h1><p>Use this code to ${action}:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;background:white;padding:20px;text-align:center;border-radius:14px">${code}</div><p style="color:#71827d">This code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.</p></div>`,
  });
}

async function validateOtp(userId, purpose, code, transaction) {
  const record = await EmailOtp.findOne({ where: { userId, purpose }, transaction });
  if (!record) {
    const error = new Error("Request a new verification code.");
    error.statusCode = 400;
    throw error;
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    const error = new Error("Too many incorrect attempts. Request a new code.");
    error.statusCode = 429;
    throw error;
  }
  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    const error = new Error("Verification code has expired. Request a new code.");
    error.statusCode = 400;
    throw error;
  }
  if (record.codeHash !== hashCode(String(code).trim())) {
    await record.increment("attempts", { transaction });
    const error = new Error("Incorrect verification code.");
    error.statusCode = 400;
    throw error;
  }
  await record.destroy({ transaction });
}

async function verifyEmailTransport() {
  return transporter.verify();
}

module.exports = { issueOtp, validateOtp, verifyEmailTransport };
