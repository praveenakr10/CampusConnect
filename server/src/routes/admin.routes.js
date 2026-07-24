const router = require("express").Router();
const {
  listAuditLogs,
  banUser,
  unbanUser,
  listUsers,
  promoteUser,
} = require("../controllers/admin.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

router.use(requireAuth, requireRole("STUDENT_ADMIN", "SUPER_ADMIN"));

router.get("/audit-logs", listAuditLogs);
router.get("/users", listUsers);
router.post("/users/:userId/ban", banUser);
router.post("/users/:userId/unban", unbanUser);
router.post("/users/:userId/role", requireRole("SUPER_ADMIN"), promoteUser);

module.exports = router;
