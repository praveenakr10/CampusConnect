const axios = require("axios");
const {
  CLIENT_ORIGIN,
  EMAIL_FROM,
  RESEND_API_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} = require("../config/env");

async function sendViaResend({ to, subject, html, text }) {
  await axios.post(
    "https://api.resend.com/emails",
    {
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
}

async function sendViaSmtp({ to, subject, html, text }) {
  // Lazy-load so dev installs without SMTP still work.
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({ from: EMAIL_FROM, to, subject, html, text });
}

function logDevEmail({ to, subject, link }) {
  console.log(`\n[email:dev] ${subject}`);
  console.log(`  To: ${to}`);
  console.log(`  Link: ${link}\n`);
}

async function sendEmail({ to, subject, html, text, devLink }) {
  if (RESEND_API_KEY) {
    await sendViaResend({ to, subject, html, text });
    return;
  }
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    await sendViaSmtp({ to, subject, html, text });
    return;
  }
  logDevEmail({ to, subject, link: devLink });
}

async function sendVerificationEmail(to, rawToken) {
  const link = `${CLIENT_ORIGIN}/verify-email?token=${rawToken}`;
  const subject = "Verify your CampusQ&A email";
  const text = `Verify your email by opening this link (expires in 24 hours):\n${link}`;
  const html = `<p>Verify your email by clicking <a href="${link}">this link</a> (expires in 24 hours).</p>`;
  await sendEmail({ to, subject, html, text, devLink: link });
}

async function sendPasswordResetEmail(to, rawToken) {
  const link = `${CLIENT_ORIGIN}/reset-password?token=${rawToken}`;
  const subject = "Reset your CampusQ&A password";
  const text = `Reset your password by opening this link (expires in 1 hour):\n${link}`;
  const html = `<p>Reset your password by clicking <a href="${link}">this link</a> (expires in 1 hour).</p>`;
  await sendEmail({ to, subject, html, text, devLink: link });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
