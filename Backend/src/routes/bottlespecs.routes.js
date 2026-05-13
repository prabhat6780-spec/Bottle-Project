const router = require("express").Router();

const {
  createSpec,
  getSpecs,
  updateSpec,
  deleteSpec
} = require("../controllers/bottlespecs.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

// Admin & Manager can manage specs
router.post("/", auth, checkAbility("create", "bottlespec"), createSpec);
router.put("/:id", auth, checkAbility("edit", "bottlespec"), updateSpec);
router.delete("/:id", auth, checkAbility("delete", "bottlespec"), deleteSpec);

// All roles can read
router.get("/", auth, checkAbility("read", "bottlespec"), getSpecs);

module.exports = router;