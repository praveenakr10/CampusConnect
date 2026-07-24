const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { logAdminAction } = require("../services/auditLog.service");

async function attachVoteCounts(answers) {
  const ids = answers.map((a) => a.id);
  const voteCounts = await prisma.vote.groupBy({
    by: ["targetId"],
    where: { targetType: "ANSWER", targetId: { in: ids } },
    _count: { targetId: true },
  });
  const countMap = new Map(voteCounts.map((v) => [v.targetId, v._count.targetId]));
  return answers.map((a) => ({ ...a, upvotes: countMap.get(a.id) || 0 }));
}

const listAnswersForQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const answers = await prisma.answer.findMany({
    where: { questionId, isDeleted: false },
    include: {
      user: { select: { id: true, name: true, reputation: true } },
      comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const withVotes = await attachVoteCounts(answers);
  withVotes.sort((a, b) => b.upvotes - a.upvotes);

  res.json({ answers: withVotes });
});

const createAnswer = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { body } = req.body;
  if (!body) throw new ApiError(400, "Answer body is required.");

  const question = await prisma.question.findFirst({ where: { id: questionId, isDeleted: false } });
  if (!question) throw new ApiError(404, "Question not found.");

  const answer = await prisma.answer.create({
    data: { questionId, body, userId: req.user.id },
    include: { user: { select: { id: true, name: true, reputation: true } } },
  });

  res.status(201).json({ answer });
});

const deleteAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const answer = await prisma.answer.findUnique({ where: { id } });
  if (!answer) throw new ApiError(404, "Answer not found.");

  const isOwner = answer.userId === req.user.id;
  const isAdmin = ["STUDENT_ADMIN", "SUPER_ADMIN"].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new ApiError(403, "You can't delete this answer.");

  await prisma.answer.update({
    where: { id },
    data: { isDeleted: true, deletedById: req.user.id },
  });

  if (isAdmin && !isOwner) {
    await logAdminAction({
      adminId: req.user.id,
      actionType: "DELETE_ANSWER",
      targetType: "answer",
      targetId: id,
      reason,
    });
  }

  res.json({ message: "Answer deleted." });
});

const addComment = asyncHandler(async (req, res) => {
  const { answerId } = req.params;
  const { body } = req.body;
  if (!body) throw new ApiError(400, "Comment body is required.");

  const answer = await prisma.answer.findUnique({ where: { id: answerId } });
  if (!answer || answer.isDeleted) throw new ApiError(404, "Answer not found.");

  const comment = await prisma.comment.create({
    data: { answerId, body, userId: req.user.id },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json({ comment });
});

module.exports = { listAnswersForQuestion, createAnswer, deleteAnswer, addComment };
