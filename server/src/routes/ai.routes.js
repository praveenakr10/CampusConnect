const router = require("express").Router();
const { improveQuestionHandler, getAnswerSummaryHandler } = require("../controllers/ai.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { aiImproverLimiter } = require("../middleware/rateLimiter.middleware");
const { dailyAiLimit } = require("../middleware/usageLimits.middleware");

router.post("/improve-question", requireAuth, dailyAiLimit, aiImproverLimiter, improveQuestionHandler);
router.get("/questions/:id/summary", requireAuth, dailyAiLimit, getAnswerSummaryHandler);

module.exports = router;
