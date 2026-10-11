import { Router } from "express";
import {
  changePassword,
  deleteMe,
  forgotPassword,
  getMe,
  login,
  logout,
  logoutAll,
  refresh,
  resendVerification,
  resetPassword,
  signup,
  updateMe,
  verifyEmail,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter, emailLimiter, loginLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  signupSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from "../validators/authSchemas.js";

const router = Router();

// Public
router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(logoutSchema), logout);
router.post("/forgot-password", emailLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", emailLimiter, validate(resendVerificationSchema), resendVerification);

// Authenticated
router.post("/logout-all", protect, logoutAll);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);
router.get("/me", protect, getMe);
router.patch("/me", protect, validate(updateProfileSchema), updateMe);
router.delete("/me", protect, validate(deleteAccountSchema), deleteMe);

/**
 * Old routes (/signup, /login, /profile) kept so the existing frontend keeps working
 * while you migrate it to /api/auth/*.
 */
export const legacyAuthRoutes = Router();
legacyAuthRoutes.post("/signup", authLimiter, validate(signupSchema), signup);
legacyAuthRoutes.post("/login", loginLimiter, validate(loginSchema), login);
legacyAuthRoutes.get("/profile", protect, getMe);

export default router;