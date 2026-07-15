const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = signToken({ userId: user.id });
  res.status(201).json({ user: sanitizeUser(user), token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid email or password.");
  if (user.isBanned) throw new ApiError(403, "Your account has been suspended.");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid email or password.");

  const token = signToken({ userId: user.id });
  res.json({ user: sanitizeUser(user), token });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = { signup, login, me };
