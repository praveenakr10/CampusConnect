const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const listPolls = asyncHandler(async (req, res) => {
  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      options: true,
      user: { select: { id: true, name: true } },
    },
  });
  res.json({ polls });
});

const getPoll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { options: true, user: { select: { id: true, name: true } } },
  });
  if (!poll) throw new ApiError(404, "Poll not found.");

  let myVote = null;
  if (req.user) {
    myVote = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId: id, userId: req.user.id } },
    });
  }

  res.json({ poll, myVote });
});

const createPoll = asyncHandler(async (req, res) => {
  const { questionText, options, isAnonymous = false, expiresAt } = req.body;

  if (!questionText || !Array.isArray(options) || options.length < 2) {
    throw new ApiError(400, "A poll needs a question and at least 2 options.");
  }

  const poll = await prisma.poll.create({
    data: {
      questionText,
      isAnonymous,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      userId: req.user.id,
      options: { create: options.map((optionText) => ({ optionText })) },
    },
    include: { options: true },
  });

  res.status(201).json({ poll });
});

const votePoll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;

  const poll = await prisma.poll.findUnique({ where: { id }, include: { options: true } });
  if (!poll) throw new ApiError(404, "Poll not found.");
  if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
    throw new ApiError(400, "This poll has expired.");
  }
  const option = poll.options.find((o) => o.id === optionId);
  if (!option) throw new ApiError(400, "Invalid option.");

  const existing = await prisma.pollVote.findUnique({
    where: { pollId_userId: { pollId: id, userId: req.user.id } },
  });
  if (existing) throw new ApiError(409, "You already voted on this poll.");

  await prisma.$transaction([
    prisma.pollVote.create({ data: { pollId: id, userId: req.user.id, optionId } }),
    prisma.pollOption.update({ where: { id: optionId }, data: { voteCount: { increment: 1 } } }),
  ]);

  const updated = await prisma.poll.findUnique({ where: { id }, include: { options: true } });
  res.json({ poll: updated });
});

const deletePoll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const poll = await prisma.poll.findUnique({ where: { id } });
  if (!poll) throw new ApiError(404, "Poll not found.");

  const isOwner = poll.userId === req.user.id;
  const isAdmin = ["STUDENT_ADMIN", "SUPER_ADMIN"].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new ApiError(403, "You can't delete this poll.");

  await prisma.poll.delete({ where: { id } });
  res.json({ message: "Poll deleted." });
});

module.exports = { listPolls, getPoll, createPoll, votePoll, deletePoll };
