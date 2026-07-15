const ApiError = require("../utils/ApiError");

// Usage: requireRole("STUDENT_ADMIN", "SUPER_ADMIN")
// Must run after requireAuth so req.user is populated.
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Not authenticated.");
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "You don't have permission to perform this action.");
  }
  next();
};

module.exports = { requireRole };
