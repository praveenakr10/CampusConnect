const prisma = require("../config/db");

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function secondsUntilTomorrowUtc(now = new Date()) {
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.max(1, Math.ceil((tomorrow.getTime() - now.getTime()) / 1000));
}

// Uses a database counter so limits are shared by all Render instances and
// survive restarts. updateMany's count condition makes consuming a slot atomic.
async function consumeDailyUsage({ userId, type, limit }) {
  const day = startOfUtcDay();

  const updated = await prisma.$transaction(async (tx) => {
    await tx.dailyUsage.upsert({
      where: { userId_type_day: { userId, type, day } },
      create: { userId, type, day, count: 0 },
      update: {},
    });

    return tx.dailyUsage.updateMany({
      where: { userId, type, day, count: { lt: limit } },
      data: { count: { increment: 1 } },
    });
  });

  return {
    allowed: updated.count === 1,
    retryAfterSeconds: secondsUntilTomorrowUtc(),
  };
}

module.exports = { consumeDailyUsage };
