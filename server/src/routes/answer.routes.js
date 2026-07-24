const router = require("express").Router();
const {
  listAnswersForQuestion,
  createAnswer,
  deleteAnswer,
  addComment,
} = require("../controllers/answer.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/question/:questionId", listAnswersForQuestion);
router.post("/question/:questionId", requireAuth, createAnswer);
router.delete("/:id", requireAuth, deleteAnswer);
router.post("/:answerId/comments", requireAuth, addComment);

module.exports = router;
