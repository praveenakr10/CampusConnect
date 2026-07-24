const router = require("express").Router();
const { listQuestions, getQuestion, createQuestion, deleteQuestion } = require("../controllers/question.controller");
const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");

router.get("/", optionalAuth, listQuestions);
router.get("/:id", optionalAuth, getQuestion);
router.post("/", requireAuth, createQuestion);
router.delete("/:id", requireAuth, deleteQuestion);

module.exports = router;
