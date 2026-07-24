const router = require("express").Router();
const { improveQuestionHandler, getAnswerSummaryHandler } = require("../controllers/ai.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { aiImproverLimiter } = require("../middleware/rateLimiter.middleware");

router.post("/improve-question", requireAuth, aiImproverLimiter, improveQuestionHandler);
router.get("/questions/:id/summary", getAnswerSummaryHandler);

module.exports = router;
