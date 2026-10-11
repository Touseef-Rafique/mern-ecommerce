import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

export async function connectDB() {
  const conn = await mongoose.connect(env.mongoUri, {
    dbName: env.dbName,
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}