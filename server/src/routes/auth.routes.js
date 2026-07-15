const router = require("express").Router();
const { signup, login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiter.middleware");

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);

module.exports = router;
