import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;

function getTransporter() {
  if (!env.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an email. In development without SMTP the message is printed instead.
 * In production without SMTP it throws, so secrets (reset links) never end up in logs.
 */
export async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    if (env.isProd) throw new Error("SMTP is not configured");
    console.log(`\n📧 [dev email] To: ${to}\n   Subject: ${subject}\n${text}\n`);
    return;
  }
  await t.sendMail({ from: env.smtp.from, to, subject, text, html });
}