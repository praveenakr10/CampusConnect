const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateSecureToken, hashToken } = require("../utils/cryptoTokens");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");
const { issueAuthTokens, rotateRefreshToken, revokeAllRefreshTokens } = require("../utils/authTokens");
const { recordFailedLogin, clearFailedLogin } = require("../middleware/rateLimiter.middleware");

const BCRYPT_ROUNDS = 12;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

function sanitizeUser(user) {
  const {
    passwordHash,
    emailVerificationTokenHash,
    emailVerificationExpiresAt,
    passwordResetTokenHash,
    passwordResetExpiresAt,
    refreshTokens,
    ...safe
  } = user;
  return safe;
}

async function createEmailVerificationToken(userId) {
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
    },
  });

  return rawToken;
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new ApiError(409, "An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash },
  });

  const rawToken = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, rawToken);

  res.status(201).json({
    message: "Account created. Please check your email to verify your account before logging in.",
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    recordFailedLogin(normalizedEmail);
    throw new ApiError(401, "Invalid email or password.");
  }
  if (user.isBanned) throw new ApiError(403, "Your account has been suspended.");
  if (!user.emailVerified) {
    throw new ApiError(
      403,
      "Please verify your email before logging in. Check your inbox for a verification link, or request a new one."
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    recordFailedLogin(normalizedEmail);
    throw new ApiError(401, "Invalid email or password.");
  }

  clearFailedLogin(normalizedEmail);
  const tokens = await issueAuthTokens(user);
  res.json({ user: sanitizeUser(user), ...tokens });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token is required.");

  const result = await rotateRefreshToken(refreshToken);
  if (!result) throw new ApiError(401, "Refresh token expired or invalid. Please log in again.");

  res.json({
    user: sanitizeUser(result.user),
    token: result.token,
    refreshToken: result.refreshToken,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) throw new ApiError(400, "Verification token is required.");

  const tokenHash = hashToken(token);
  const user = await prisma.user.findFirst({
    where: { emailVerificationTokenHash: tokenHash },
  });

  if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    throw new ApiError(400, "Verification link is invalid or has expired.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
  });

  res.json({ message: "Email verified successfully. You can now log in." });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required.");

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user && !user.emailVerified) {
    const rawToken = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(user.email, rawToken);
  }

  res.json({
    message: "If an unverified account exists for that email, a new verification link has been sent.",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required.");

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Demo credentials are shared and must remain stable.
  if (user && user.role !== "DEMO") {
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    await sendPasswordResetEmail(user.email, rawToken);
  }

  res.json({
    message: "If an account exists for that email, a password reset link has been sent.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError(400, "Token and new password are required.");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");

  const tokenHash = hashToken(token);
  const user = await prisma.user.findFirst({
    where: { passwordResetTokenHash: tokenHash },
  });

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    throw new ApiError(400, "Password reset link is invalid or has expired.");
  }
  if (user.role === "DEMO") {
    throw new ApiError(403, "The demo account password cannot be changed.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });
  await revokeAllRefreshTokens(user.id);

  res.json({ message: "Password updated successfully. You can now log in with your new password." });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = {
  signup,
  login,
  refresh,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
};
