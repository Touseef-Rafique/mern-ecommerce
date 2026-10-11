import compression from "compression";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import mongoose from "mongoose";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import authRoutes, { legacyAuthRoutes } from "./routes/authRoutes.js";
import mobileRoutes from "./routes/mobileRoutes.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // running behind one proxy (Render), so req.ip is the real client

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // No Origin header = curl, mobile apps, server-to-server. Browsers always send one.
      if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(null, false);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count", "X-Total-Pages", "X-Page"],
    maxAge: 600,
  })
);
app.use(compression());
if (env.nodeEnv !== "test") app.use(morgan(env.isProd ? "combined" : "dev"));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(mongoSanitize()); // strips $ and . operators from input (NoSQL injection)
app.use(hpp()); // collapses duplicate query params

// Health checks stay outside the rate limiter so uptime monitors never get blocked.
app.get("/", (req, res) => res.send("API Running 🚀"));
app.get("/health", (req, res) => {
  const state = mongoose.connection.readyState;
  const ok = state === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    db: ["disconnected", "connected", "connecting", "disconnecting"][state],
    uptime: Math.round(process.uptime()),
  });
});

app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/", legacyAuthRoutes); // /signup, /login, /profile (old frontend)
app.use("/api/mobiles", mobileRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;