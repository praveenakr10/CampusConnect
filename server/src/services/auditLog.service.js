const prisma = require("../config/db");

async function logAdminAction({ adminId, actionType, targetType, targetId, reason }) {
  return prisma.auditLog.create({
    data: { adminId, actionType, targetType, targetId, reason },
  });
}

module.exports = { logAdminAction };
