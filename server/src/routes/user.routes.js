const router = require("express").Router();
const { getUserProfile } = require("../controllers/user.controller");

router.get("/:id", getUserProfile);

module.exports = router;
