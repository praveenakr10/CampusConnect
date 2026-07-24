const router = require("express").Router();
const { toggleVote } = require("../controllers/vote.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/", requireAuth, toggleVote);

module.exports = router;
