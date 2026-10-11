import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { randomToken, sha256 } from "../utils/crypto.js";

export const JWT_ISSUER = "technest-api";

/** Short-lived access token. `isAdmin` is included only for frontend convenience; the server re-checks the DB. */
export const signAccessToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role, isAdmin: user.role === "admin" },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenTtl, issuer: JWT_ISSUER, algorithm: "HS256" }
  );

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwtAccessSecret, { algorithms: ["HS256"], issuer: JWT_ISSUER });

/** Creates an opaque refresh token, stores only its hash, and returns the raw value. */
export async function issueRefreshToken(user, req, family = randomToken(16)) {
  const raw = randomToken(48);
  await RefreshToken.create({
    user: user._id,
    tokenHash: sha256(raw),
    family,
    expiresAt: new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000),
    userAgent: req.get("user-agent")?.slice(0, 200),
    ip: req.ip,
  });
  return raw;
}

/**
 * Exchanges a refresh token for a new one (rotation).
 * Presenting an already-used token means it was likely stolen, so the whole family is revoked.
 */
export async function rotateRefreshToken(raw, req) {
  const invalid = () => new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");

  const doc = await RefreshToken.findOne({ tokenHash: sha256(raw) });
  if (!doc) throw invalid();

  if (doc.revokedAt) {
    await RefreshToken.updateMany({ family: doc.family, revokedAt: null }, { revokedAt: new Date() });
    throw new AppError("Session is no longer valid. Please log in again.", 401, "TOKEN_REUSE_DETECTED");
  }
  if (doc.expiresAt.getTime() < Date.now()) throw invalid();

  // Atomic claim so two concurrent requests can't both rotate the same token.
  const claimed = await RefreshToken.findOneAndUpdate(
    { _id: doc._id, revokedAt: null },
    { revokedAt: new Date() }
  );
  if (!claimed) throw invalid();

  const user = await User.findById(doc.user);
  if (!user || !user.active) throw invalid();

  const refreshToken = await issueRefreshToken(user, req, doc.family);
  return { user, refreshToken };
}

export async function revokeRefreshToken(raw) {
  if (!raw) return;
  await RefreshToken.updateOne({ tokenHash: sha256(raw), revokedAt: null }, { revokedAt: new Date() });
}

export async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}