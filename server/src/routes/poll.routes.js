const router = require("express").Router();
const { listPolls, getPoll, createPoll, votePoll, deletePoll } = require("../controllers/poll.controller");
const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");

router.get("/", listPolls);
router.get("/:id", optionalAuth, getPoll);
router.post("/", requireAuth, createPoll);
router.post("/:id/vote", requireAuth, votePoll);
router.delete("/:id", requireAuth, deletePoll);

module.exports = router;
