import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import User from "../models/User.js";
import {
  issueRefreshToken,
  revokeAllUserTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from "../services/tokenService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sha256 } from "../utils/crypto.js";
import { sendEmail } from "../utils/email.js";
import { passwordChangedEmail, passwordResetEmail, verificationEmail } from "../utils/emailTemplates.js";

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", env.bcryptRounds);

const GENERIC_EMAIL_MESSAGE = "If an account exists for that email, we've sent instructions to it.";

/** ADMIN_EMAIL in the environment is the single source of truth for who is an admin. */
function syncAdminRole(user) {
  const isAdmin = env.adminEmails.includes(user.email) && (!env.requireEmailVerification || user.emailVerified);
  user.role = isAdmin ? "admin" : "user";
}

/** Emails must never block or fail a request, so errors are only logged. */
function sendInBackground(to, template) {
  sendEmail({ to, ...template }).catch((err) => console.error(`Email to ${to} failed:`, err.message));
}

async function sendAuthResponse(req, res, user, status, message) {
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, req);
  res.status(status).json({
    message,
    token: accessToken, // same field name the existing frontend already reads
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: env.accessTokenTtl,
    userId: user._id,
    isAdmin: user.role === "admin",
    user: user.toPublic(),
  });
}

/* ───────────────────────── Sign up / log in ───────────────────────── */

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
  }

  const user = new User({ name, email, password });
  syncAdminRole(user);
  const verifyToken = user.createEmailVerificationToken();
  await user.save();

  sendInBackground(user.email, verificationEmail(user.name, verifyToken));

  if (env.requireEmailVerification) {
    return res.status(201).json({
      message: "Account created. Please check your email to verify your address before logging in.",
      requiresVerification: true,
    });
  }
  return sendAuthResponse(req, res, user, 201, "Account created successfully");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (user.isLocked()) {
    const minutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    throw new AppError(
      `Too many failed attempts. Account is locked for another ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      429,
      "ACCOUNT_LOCKED"
    );
  }

  if (!(await user.comparePassword(password))) {
    const updated = await User.findByIdAndUpdate(user._id, { $inc: { failedLoginAttempts: 1 } }, { new: true });
    if (updated.failedLoginAttempts >= env.maxLoginAttempts) {
      await User.updateOne(
        { _id: user._id },
        { $set: { lockUntil: new Date(Date.now() + env.lockMinutes * 60000), failedLoginAttempts: 0 } }
      );
    }
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (!user.active) {
    throw new AppError("This account has been disabled", 403, "ACCOUNT_DISABLED");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  syncAdminRole(user);
  await user.save();

  if (env.requireEmailVerification && !user.emailVerified) {
    throw new AppError("Please verify your email before logging in", 403, "EMAIL_NOT_VERIFIED");
  }

  return sendAuthResponse(req, res, user, 200, "Login successful");
});

/* ───────────────────────── Sessions ───────────────────────── */

export const refresh = asyncHandler(async (req, res) => {
  const { user, refreshToken } = await rotateRefreshToken(req.body.refreshToken, req);
  const accessToken = signAccessToken(user);
  res.json({ token: accessToken, accessToken, refreshToken, tokenType: "Bearer", expiresIn: env.accessTokenTtl });
});

export const logout = asyncHandler(async (req, res) => {
  await revokeRefreshToken(req.body.refreshToken);
  res.json({ message: "Logged out" });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllUserTokens(req.user._id);
  res.json({ message: "Logged out from all devices" });
});

/* ───────────────────────── Profile ───────────────────────── */

export const getMe = (req, res) => {
  const user = req.user.toPublic();
  // `id` and `isAdmin` at the top level match what the old /profile endpoint returned.
  res.json({ ...user, user });
};

export const updateMe = asyncHandler(async (req, res) => {
  req.user.name = req.body.name;
  await req.user.save();
  res.json({ message: "Profile updated", user: req.user.toPublic() });
});

export const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.password))) {
    throw new AppError("Password is incorrect", 401, "INVALID_CREDENTIALS");
  }
  await revokeAllUserTokens(user._id);
  await user.deleteOne();
  res.json({ message: "Account deleted" });
});

/* ───────────────────────── Passwords ───────────────────────── */

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 401, "INVALID_CREDENTIALS");
  }

  user.password = newPassword;
  await user.save();
  await revokeAllUserTokens(user._id); // sign out every other device

  sendInBackground(user.email, passwordChangedEmail(user.name));
  return sendAuthResponse(req, res, user, 200, "Password changed successfully");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user && user.active) {
    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
      await sendEmail({ to: user.email, ...passwordResetEmail(user.name, rawToken) });
    } catch (err) {
      console.error(`Password reset email to ${user.email} failed:`, err.message);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  // Same response whether or not the account exists, so emails can't be enumerated.
  res.json({ message: GENERIC_EMAIL_MESSAGE });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: sha256(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new AppError("Reset link is invalid or has expired", 400, "INVALID_RESET_TOKEN");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.emailVerified = true; // they just proved they control this inbox
  await user.save();
  await revokeAllUserTokens(user._id);

  sendInBackground(user.email, passwordChangedEmail(user.name));
  res.json({ message: "Password has been reset. You can now log in with your new password." });
});

/* ───────────────────────── Email verification ───────────────────────── */

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: sha256(req.body.token),
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new AppError("Verification link is invalid or has expired", 400, "INVALID_VERIFICATION_TOKEN");
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  syncAdminRole(user);
  await user.save();

  res.json({ message: "Email verified successfully" });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user && user.active && !user.emailVerified) {
    const rawToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    sendInBackground(user.email, verificationEmail(user.name, rawToken));
  }

  res.json({ message: GENERIC_EMAIL_MESSAGE });
});