const prisma = require("../config/db");
const { signAccessToken } = require("./jwt");
const { generateSecureToken, hashToken } = require("./cryptoTokens");
const { JWT_REFRESH_EXPIRES_IN_MS } = require("../config/env");

async function createRefreshToken(userId) {
  const rawRefresh = generateSecureToken();
  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + JWT_REFRESH_EXPIRES_IN_MS);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawRefresh;
}

async function issueAuthTokens(user) {
  const token = signAccessToken({ userId: user.id });
  const refreshToken = await createRefreshToken(user.id);
  return { token, refreshToken };
}

async function rotateRefreshToken(rawRefresh) {
  const tokenHash = hashToken(rawRefresh);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || user.isBanned) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    return null;
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const token = signAccessToken({ userId: user.id });
  const refreshToken = await createRefreshToken(user.id);
  return { user, token, refreshToken };
}

async function revokeAllRefreshTokens(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

module.exports = { issueAuthTokens, rotateRefreshToken, revokeAllRefreshTokens };
