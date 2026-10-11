import mongoose from "mongoose";
import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const notFound = (req, res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));

// Converts known library errors into AppErrors so every response has the same shape.
function normalize(err) {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new AppError(errors[0]?.message || "Validation failed", 400, "VALIDATION_ERROR", errors);
  }
  if (err instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid ${err.path}`, 400, "INVALID_ID");
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "value";
    const label = field === "email" ? "Email" : field;
    return new AppError(`${label} already exists`, 409, "DUPLICATE");
  }
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be 5MB or smaller" : `Upload error: ${err.message}`;
    return new AppError(message, 400, "UPLOAD_ERROR");
  }
  if (err.type === "entity.parse.failed") return new AppError("Invalid JSON body", 400, "INVALID_JSON");
  if (err.type === "entity.too.large") return new AppError("Request body too large", 413, "PAYLOAD_TOO_LARGE");

  return err;
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const error = normalize(err);
  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) console.error(`❌ ${req.method} ${req.originalUrl}`, err);

  // Never leak internals on 5xx in production.
  const message = isServerError && env.isProd ? "Something went wrong. Please try again later." : error.message;

  res.status(statusCode).json({
    status: isServerError ? "error" : "fail",
    message,
    error: message, // kept for older frontend code that reads `error`
    code: error.code,
    errors: error.errors,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};