import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`🚀 Server running on port ${env.port} (${env.nodeEnv})`);
  });

  let shuttingDown = false;
  const shutdown = (reason, code = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${reason} - shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(code);
    });
    setTimeout(() => process.exit(1), 10000).unref(); // force exit if connections hang
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
    shutdown("unhandledRejection", 1);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    shutdown("uncaughtException", 1);
  });
}

start();