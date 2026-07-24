const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { improveQuestion } = require("../services/ai/questionImprover.service");
const { getOrGenerateSummary } = require("../services/ai/answerSummarizer.service");
const prisma = require("../config/db");

// POST /api/ai/improve-question  { title, body }
const improveQuestionHandler = asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) throw new ApiError(400, "Title and body are required.");

  try {
    const result = await improveQuestion(title, body);
    res.json({
      original: { title, body },
      improved: { title: result.improvedTitle, body: result.improvedBody },
    });
  } catch (err) {
    console.error("AI improve error:", err.message);
    throw new ApiError(503, "AI Question Improver is temporarily unavailable. Please try again shortly.");
  }
});

// GET /api/ai/questions/:id/summary
const getAnswerSummaryHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const question = await prisma.question.findFirst({ where: { id, isDeleted: false } });
  if (!question) throw new ApiError(404, "Question not found.");

  try {
    const result = await getOrGenerateSummary(id);
    res.json(result);
  } catch (err) {
    console.error("AI summary error:", err.message);
    throw new ApiError(503, "AI Answer Summarizer is temporarily unavailable. Please try again shortly.");
  }
});

module.exports = { improveQuestionHandler, getAnswerSummaryHandler };
