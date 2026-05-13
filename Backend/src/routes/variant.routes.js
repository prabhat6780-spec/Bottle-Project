const router = require("express").Router();

const {
  createVariant,
  getVariants,
  updateVariant,
  deleteVariant
} = require("../controllers/variant.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

// 👑 Admin & Manager can manage variants
router.post("/", auth, checkAbility("create", "variant"), createVariant);
router.put("/:id", auth, checkAbility("edit", "variant"), updateVariant);
router.delete("/:id", auth, checkAbility("delete", "variant"), deleteVariant);

// 👀 All roles can read
router.get("/", auth, checkAbility("read", "variant"), getVariants);

module.exports = router;