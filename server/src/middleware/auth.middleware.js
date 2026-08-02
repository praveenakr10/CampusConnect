const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { demoDailyApiLimit } = require("./usageLimits.middleware");

// Requires a valid JWT. Attaches the fresh user record (minus password) to req.user.
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw new ApiError(401, "Not authenticated. Please log in.");

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, "Session expired or invalid. Please log in again.");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new ApiError(401, "User no longer exists.");
  if (user.isBanned) throw new ApiError(403, "Your account has been suspended.");
  if (user.role === "DEMO" && req.method === "DELETE") {
    throw new ApiError(403, "The demo account cannot delete data.");
  }

  req.user = user;
  await demoDailyApiLimit(req, res, next);
});

// Attaches req.user if a valid token is present, but doesn't reject the
// request otherwise. Useful for routes that behave differently for
// logged-in vs anonymous users (e.g. showing "you already voted").
const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    // ignore invalid token for optional auth
    return next();
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (user && !user.isBanned) {
    if (user.role === "DEMO" && req.method === "DELETE") {
      throw new ApiError(403, "The demo account cannot delete data.");
    }
    req.user = user;
    await demoDailyApiLimit(req, res, next);
    return;
  }
  next();
});

module.exports = { requireAuth, optionalAuth };
