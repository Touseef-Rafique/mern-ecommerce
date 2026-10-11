import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { randomToken, sha256 } from "../utils/crypto.js";

const HOUR = 60 * 60 * 1000;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, "Email is required"],
      maxlength: 254,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    active: { type: Boolean, default: true },

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: Date,

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash the password whenever it is set or changed.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.bcryptRounds);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function () {
  return !!this.lockUntil && this.lockUntil.getTime() > Date.now();
};

/** True if the password changed after the JWT (iat, in seconds) was issued. */
userSchema.methods.changedPasswordAfter = function (iat) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > iat;
};

// Raw tokens go to the user by email; only the SHA-256 hash is stored.
userSchema.methods.createEmailVerificationToken = function () {
  const raw = randomToken(32);
  this.emailVerificationToken = sha256(raw);
  this.emailVerificationExpires = new Date(Date.now() + 24 * HOUR);
  return raw;
};

userSchema.methods.createPasswordResetToken = function () {
  const raw = randomToken(32);
  this.passwordResetToken = sha256(raw);
  this.passwordResetExpires = new Date(Date.now() + 0.25 * HOUR); // 15 minutes
  return raw;
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isAdmin: this.role === "admin",
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);
export default User;