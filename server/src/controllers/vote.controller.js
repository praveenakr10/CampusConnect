const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { awardUpvotePoints, revokeUpvotePoints } = require("../services/reputation.service");

// Toggle upvote: if the user already upvoted this target, calling again removes it.
const toggleVote = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body;
  if (!["QUESTION", "ANSWER"].includes(targetType)) {
    throw new ApiError(400, "targetType must be QUESTION or ANSWER.");
  }

  const model = targetType === "QUESTION" ? prisma.question : prisma.answer;
  const target = await model.findUnique({ where: { id: targetId } });
  if (!target || target.isDeleted) throw new ApiError(404, "Content not found.");

  const existing = await prisma.vote.findUnique({
    where: { userId_targetType_targetId: { userId: req.user.id, targetType, targetId } },
  });

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } });
    await revokeUpvotePoints(target.userId);
    const count = await prisma.vote.count({ where: { targetType, targetId } });
    return res.json({ upvoted: false, upvotes: count });
  }

  await prisma.vote.create({ data: { userId: req.user.id, targetType, targetId } });
  await awardUpvotePoints(target.userId);
  const count = await prisma.vote.count({ where: { targetType, targetId } });
  res.json({ upvoted: true, upvotes: count });
});

module.exports = { toggleVote };
