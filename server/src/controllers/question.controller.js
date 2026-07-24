const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { logAdminAction } = require("../services/auditLog.service");

async function attachVoteCounts(questions) {
  const ids = questions.map((q) => q.id);
  const voteCounts = await prisma.vote.groupBy({
    by: ["targetId"],
    where: { targetType: "QUESTION", targetId: { in: ids } },
    _count: { targetId: true },
  });
  const countMap = new Map(voteCounts.map((v) => [v.targetId, v._count.targetId]));
  return questions.map((q) => ({ ...q, upvotes: countMap.get(q.id) || 0 }));
}

const listQuestions = asyncHandler(async (req, res) => {
  const { tag, sort = "newest", search, page = 1, pageSize = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);

  const where = {
    isDeleted: false,
    ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { body: { contains: search } },
          ],
        }
      : {}),
  };

  const orderBy = sort === "newest" ? { createdAt: "desc" } : { createdAt: "desc" };
  // "most upvoted" is computed post-fetch below since upvotes aren't a column.

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy,
      skip,
      take: Number(pageSize),
      include: {
        user: { select: { id: true, name: true, reputation: true } },
        tags: { include: { tag: true } },
        _count: { select: { answers: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  let withVotes = await attachVoteCounts(questions);
  if (sort === "most_upvoted") withVotes.sort((a, b) => b.upvotes - a.upvotes);
  if (sort === "unanswered") withVotes = withVotes.filter((q) => q._count.answers === 0);

  res.json({
    questions: withVotes,
    pagination: { page: Number(page), pageSize: Number(pageSize), total },
  });
});

const getQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await prisma.question.findFirst({
    where: { id, isDeleted: false },
    include: {
      user: { select: { id: true, name: true, reputation: true } },
      tags: { include: { tag: true } },
    },
  });
  if (!question) throw new ApiError(404, "Question not found.");

  await prisma.question.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  const [withVotes] = await attachVoteCounts([question]);
  res.json({ question: withVotes });
});

const createQuestion = asyncHandler(async (req, res) => {
  const { title, body, tags = [], useImprovedVersion = false, improvedTitle, improvedBody } = req.body;

  if (!title || !body) throw new ApiError(400, "Title and body are required.");

  const finalTitle = useImprovedVersion && improvedTitle ? improvedTitle : title;
  const finalBody = useImprovedVersion && improvedBody ? improvedBody : body;

  const question = await prisma.question.create({
    data: {
      title: finalTitle,
      body: finalBody,
      userId: req.user.id,
      aiImprovedTitle: improvedTitle || null,
      aiImprovedBody: improvedBody || null,
      tags: {
        create: await Promise.all(
          tags.map(async (tagName) => {
            const tag = await prisma.tag.upsert({
              where: { name: tagName.toLowerCase().trim() },
              update: {},
              create: { name: tagName.toLowerCase().trim() },
            });
            return { tag: { connect: { id: tag.id } } };
          })
        ),
      },
    },
    include: { tags: { include: { tag: true } }, user: { select: { id: true, name: true } } },
  });

  res.status(201).json({ question });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) throw new ApiError(404, "Question not found.");

  const isOwner = question.userId === req.user.id;
  const isAdmin = ["STUDENT_ADMIN", "SUPER_ADMIN"].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new ApiError(403, "You can't delete this question.");

  await prisma.question.update({
    where: { id },
    data: { isDeleted: true, deletedById: req.user.id, deletedReason: reason || null },
  });

  if (isAdmin && !isOwner) {
    await logAdminAction({
      adminId: req.user.id,
      actionType: "DELETE_QUESTION",
      targetType: "question",
      targetId: id,
      reason,
    });
  }

  res.json({ message: "Question deleted." });
});

module.exports = { listQuestions, getQuestion, createQuestion, deleteQuestion };
