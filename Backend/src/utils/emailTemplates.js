import { env } from "../config/env.js";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const layout = ({ heading, intro, ctaUrl, ctaLabel, outro }) => `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:10px;padding:32px;">
          <tr><td>
            <h2 style="margin:0 0 16px;font-size:20px;">${esc(heading)}</h2>
            <p style="margin:0 0 20px;line-height:1.5;">${intro}</p>
            ${
              ctaUrl
                ? `<p style="margin:0 0 20px;"><a href="${ctaUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:bold;">${esc(ctaLabel)}</a></p>
            <p style="margin:0 0 20px;font-size:12px;color:#6b7280;word-break:break-all;">Or paste this link into your browser:<br>${ctaUrl}</p>`
                : ""
            }
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${outro}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

export const verificationEmail = (name, token) => {
  const url = `${env.frontendUrl}/verify-email?token=${token}`;
  return {
    subject: `Verify your ${env.appName} email`,
    text: `Hi ${name},\n\nWelcome to ${env.appName}! Verify your email address using this link (valid for 24 hours):\n${url}\n\nIf you didn't create an account, you can ignore this email.`,
    html: layout({
      heading: `Welcome to ${env.appName}`,
      intro: `Hi ${esc(name)}, please confirm your email address to finish setting up your account. This link is valid for 24 hours.`,
      ctaUrl: url,
      ctaLabel: "Verify email",
      outro: "If you didn't create an account, you can safely ignore this email.",
    }),
  };
};

export const passwordResetEmail = (name, token) => {
  const url = `${env.frontendUrl}/reset-password?token=${token}`;
  return {
    subject: `Reset your ${env.appName} password`,
    text: `Hi ${name},\n\nWe received a request to reset your password. Use this link within 15 minutes:\n${url}\n\nIf you didn't request this, you can ignore this email. Your password won't change.`,
    html: layout({
      heading: "Reset your password",
      intro: `Hi ${esc(name)}, we received a request to reset your password. This link is valid for 15 minutes.`,
      ctaUrl: url,
      ctaLabel: "Reset password",
      outro: "If you didn't request this, you can safely ignore this email. Your password won't change.",
    }),
  };
};

export const passwordChangedEmail = (name) => ({
  subject: `Your ${env.appName} password was changed`,
  text: `Hi ${name},\n\nYour password was just changed and all other sessions were signed out. If this wasn't you, reset your password immediately and contact support.`,
  html: layout({
    heading: "Your password was changed",
    intro: `Hi ${esc(name)}, your password was just changed and all other devices were signed out.`,
    outro: "If this wasn't you, reset your password immediately using the 'Forgot password' option.",
  }),
});