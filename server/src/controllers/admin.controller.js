const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { logAdminAction } = require("../services/auditLog.service");

const listAuditLogs = asyncHandler(async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { id: true, name: true } } },
    take: 200,
  });
  res.json({ logs });
});

const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (userId === req.user.id) throw new ApiError(400, "You can't ban yourself.");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new ApiError(404, "User not found.");
  if (target.role === "SUPER_ADMIN") throw new ApiError(403, "Cannot ban a super admin.");

  await prisma.user.update({ where: { id: userId }, data: { isBanned: true } });
  await logAdminAction({
    adminId: req.user.id,
    actionType: "BAN_USER",
    targetType: "user",
    targetId: userId,
    reason,
  });

  res.json({ message: "User banned." });
});

const unbanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await prisma.user.update({ where: { id: userId }, data: { isBanned: false } });
  await logAdminAction({
    adminId: req.user.id,
    actionType: "UNBAN_USER",
    targetType: "user",
    targetId: userId,
  });
  res.json({ message: "User unbanned." });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, reputation: true, isBanned: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

const promoteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!["STUDENT", "STUDENT_ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new ApiError(400, "Invalid role.");
  }
  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAdminAction({
    adminId: req.user.id,
    actionType: `SET_ROLE_${role}`,
    targetType: "user",
    targetId: userId,
  });
  res.json({ user: { id: updated.id, name: updated.name, role: updated.role } });
});

module.exports = { listAuditLogs, banUser, unbanUser, listUsers, promoteUser };
