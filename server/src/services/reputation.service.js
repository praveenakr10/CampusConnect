const prisma = require("../config/db");

const POINTS_PER_UPVOTE = 5;

async function awardUpvotePoints(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { reputation: { increment: POINTS_PER_UPVOTE } },
  });
}

async function revokeUpvotePoints(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { reputation: { decrement: POINTS_PER_UPVOTE } },
  });
}

module.exports = { awardUpvotePoints, revokeUpvotePoints };
