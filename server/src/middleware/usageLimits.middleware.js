const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { consumeDailyUsage } = require("../services/dailyUsage.service");
const {
  DEMO_DAILY_API_LIMIT,
  DAILY_UPLOAD_LIMIT,
  DAILY_AI_LIMIT,
} = require("../config/env");

async function enforceLimit(req, res, { type, limit, message }) {
  const result = await consumeDailyUsage({ userId: req.user.id, type, limit });
  if (result.allowed) return;

  res.setHeader("Retry-After", result.retryAfterSeconds);
  throw new ApiError(429, message);
}

const demoDailyApiLimit = asyncHandler(async (req, res, next) => {
  if (req.user.role === "DEMO") {
    await enforceLimit(req, res, {
      type: "API",
      limit: DEMO_DAILY_API_LIMIT,
      message: `The demo account is limited to ${DEMO_DAILY_API_LIMIT} API requests per day. Try again tomorrow.`,
    });
  }
  next();
});

const dailyUploadLimit = asyncHandler(async (req, res, next) => {
  // Do not consume an upload allowance when an event has no poster.
  if (req.file) {
    await enforceLimit(req, res, {
      type: "UPLOAD",
      limit: DAILY_UPLOAD_LIMIT,
      message: `You can upload at most ${DAILY_UPLOAD_LIMIT} files per day. Try again tomorrow.`,
    });
  }
  next();
});

const dailyAiLimit = asyncHandler(async (req, res, next) => {
  await enforceLimit(req, res, {
    type: "AI",
    limit: DAILY_AI_LIMIT,
    message: `You can make at most ${DAILY_AI_LIMIT} AI requests per day. Try again tomorrow.`,
  });
  next();
});

module.exports = { demoDailyApiLimit, dailyUploadLimit, dailyAiLimit };
