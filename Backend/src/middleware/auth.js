import User from "../models/User.js";
import { verifyAccessToken } from "../services/tokenService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Requires a valid access token. The user is re-loaded from the database on every request,
 * so deleted/disabled accounts, role changes and password changes take effect immediately.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401, "NO_TOKEN");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(header.slice(7).trim());
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Access token expired", 401, "TOKEN_EXPIRED");
    }
    throw new AppError("Invalid token", 401, "INVALID_TOKEN");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.active) {
    throw new AppError("Account no longer exists or is disabled", 401, "INVALID_TOKEN");
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new AppError("Password was changed. Please log in again.", 401, "PASSWORD_CHANGED");
  }

  req.user = user;
  next();
});

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Admin access only", 403, "FORBIDDEN"));
  }
  next();
};