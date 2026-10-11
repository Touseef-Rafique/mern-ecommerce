import { z } from "zod";

const text = (label) =>
  z.string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` });

const email = text("Email")
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .email("Please enter a valid email address");

// bcrypt only uses the first 72 bytes, so cap the length there.
const strongPassword = text("Password")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number");

const name = text("Name")
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters");

const token = text("Token").min(20, "Invalid token").max(256, "Invalid token");

export const signupSchema = z.object({ name, email, password: strongPassword });

// No strength rules on login so older accounts with weaker passwords can still sign in.
export const loginSchema = z.object({
  email,
  password: text("Password").min(1, "Password is required").max(128, "Password is too long"),
});

export const refreshSchema = z.object({
  refreshToken: text("Refresh token").min(1, "Refresh token is required").max(512),
});

export const logoutSchema = z.object({
  refreshToken: z.string().max(512).optional(),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({ token, password: strongPassword });

export const verifyEmailSchema = z.object({ token });

export const resendVerificationSchema = z.object({ email });

export const changePasswordSchema = z
  .object({
    currentPassword: text("Current password").min(1, "Current password is required").max(128),
    newPassword: strongPassword,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export const updateProfileSchema = z.object({ name });

export const deleteAccountSchema = z.object({
  password: text("Password").min(1, "Password is required").max(128),
});