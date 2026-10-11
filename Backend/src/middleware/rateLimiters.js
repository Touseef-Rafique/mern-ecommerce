import rateLimit from "express-rate-limit";

const make = ({ windowMs, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({ status: "fail", message, error: message, code: "RATE_LIMITED" }),
  });

const MIN = 60 * 1000;

/** Baseline for the whole API. */
export const apiLimiter = make({
  windowMs: 15 * MIN,
  limit: 300,
  message: "Too many requests. Please slow down and try again later.",
});

/** Signup, reset-password, verify-email. */
export const authLimiter = make({
  windowMs: 15 * MIN,
  limit: 20,
  message: "Too many attempts. Please try again in a few minutes.",
});

/** Only failed logins count against the limit. */
export const loginLimiter = make({
  windowMs: 15 * MIN,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

/** Anything that sends an email (forgot password, resend verification). */
export const emailLimiter = make({
  windowMs: 60 * MIN,
  limit: 5,
  message: "Too many requests. Please try again in an hour.",
});