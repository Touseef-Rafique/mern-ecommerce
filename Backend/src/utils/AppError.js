/** Operational error with an HTTP status and a machine-readable code. */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = undefined, errors = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}