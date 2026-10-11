import dotenv from "dotenv";

dotenv.config();

const list = (v) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const int = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

// JWT_SECRET is accepted for backwards compatibility with the old setup.
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

const problems = [];
if (!process.env.MONGO_URI) problems.push("MONGO_URI is required");
if (!jwtAccessSecret) {
  problems.push("JWT_ACCESS_SECRET (or legacy JWT_SECRET) is required");
} else if (jwtAccessSecret.length < 32) {
  if (isProd) {
    problems.push(
      "JWT secret must be at least 32 characters in production. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
  } else {
    console.warn("⚠️  JWT secret is shorter than 32 characters. Use a long random value.");
  }
}

if (problems.length) {
  console.error("❌ Invalid environment configuration:");
  problems.forEach((p) => console.error(`   - ${p}`));
  process.exit(1);
}

export const env = {
  nodeEnv,
  isProd,
  appName: process.env.APP_NAME || "TechNest",
  port: int(process.env.PORT, 5000),

  mongoUri: process.env.MONGO_URI,
  dbName: process.env.MONGO_DB_NAME || "clean_mobiles_db",

  jwtAccessSecret,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenDays: int(process.env.REFRESH_TOKEN_DAYS, 7),
  bcryptRounds: int(process.env.BCRYPT_ROUNDS, 12),

  adminEmails: list(process.env.ADMIN_EMAIL).map((e) => e.toLowerCase()),
  requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
  maxLoginAttempts: int(process.env.MAX_LOGIN_ATTEMPTS, 5),
  lockMinutes: int(process.env.LOCK_MINUTES, 15),

  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, ""),
  corsOrigins: list(process.env.CORS_ORIGINS),

  smtp: {
    host: process.env.SMTP_HOST,
    port: int(process.env.SMTP_PORT, 465),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },

  Cloudinary: {
    cloudName: process.env.Cloudinary_CLOUD_NAME,
    apiKey: process.env.Cloudinary_API_KEY,
    apiSecret: process.env.Cloudinary_API_SECRET,
  },
};

if (env.adminEmails.length === 0) {
  console.warn("⚠️  ADMIN_EMAIL is not set. No account will have admin access.");
}
if (isProd && env.corsOrigins.length === 0) {
  console.warn("⚠️  CORS_ORIGINS is not set. Any website can call this API from a browser.");
}
if (!env.smtp.host) {
  console.warn(
    isProd
      ? "⚠️  SMTP is not configured. Verification and password-reset emails cannot be sent."
      : "ℹ️  SMTP not configured. Emails will be printed to the console in development."
  );
}
if (!env.Cloudinary.cloudName || !env.Cloudinary.apiKey || !env.Cloudinary.apiSecret) {
  console.warn("⚠️  Cloudinary credentials are missing. Image uploads will fail.");
}