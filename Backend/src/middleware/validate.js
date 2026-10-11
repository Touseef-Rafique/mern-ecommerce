import { AppError } from "../utils/AppError.js";

/**
 * Validates req[source] against a Zod schema. Unknown fields are stripped,
 * which also blocks mass-assignment (e.g. a client sending { role: "admin" }).
 */
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(new AppError(errors[0].message, 400, "VALIDATION_ERROR", errors));
    }
    req[source] = result.data;
    next();
  };