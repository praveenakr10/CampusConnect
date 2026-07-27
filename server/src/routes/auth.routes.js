const router = require("express").Router();
const {
  signup,
  login,
  refresh,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { signupLimiter, loginEmailLockout } = require("../middleware/rateLimiter.middleware");

router.post("/signup", signupLimiter, signup);
router.post("/login", loginEmailLockout, login);
router.post("/refresh", refresh);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, me);

module.exports = router;
