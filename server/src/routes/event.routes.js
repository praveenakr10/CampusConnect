const router = require("express").Router();
const { listEvents, getEvent, createEvent, deleteEvent } = require("../controllers/event.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const { dailyUploadLimit } = require("../middleware/usageLimits.middleware");

router.get("/", listEvents);
router.get("/:id", getEvent);

router.post(
  "/",
  requireAuth,
  requireRole("STUDENT_ADMIN", "SUPER_ADMIN"),
  upload.single("poster"),
  dailyUploadLimit,
  createEvent
);

router.delete("/:id", requireAuth, requireRole("STUDENT_ADMIN", "SUPER_ADMIN"), deleteEvent);

module.exports = router;
