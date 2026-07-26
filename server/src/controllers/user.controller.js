const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// GET /api/users/:id — public profile: stats + recent activity.
// Email is deliberately excluded from the response for privacy.
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      reputation: true,
      createdAt: true,
      isBanned: true,
      _count: { select: { questions: true, answers: true } },
    },
  });
  if (!user) throw new ApiError(404, "User not found.");

  const [recentQuestions, recentAnswers] = await Promise.all([
    prisma.question.findMany({
      where: { userId: id, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { answers: true } } },
    }),
    prisma.answer.findMany({
      where: { userId: id, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { question: { select: { id: true, title: true } } },
    }),
  ]);

  res.json({ user, recentQuestions, recentAnswers });
});

module.exports = { getUserProfile };
