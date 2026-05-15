const router = require("express").Router();

const {
  createVariant,
  getVariants,
  updateVariant,
  deleteVariant
} = require("../controllers/variant.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");
const upload = require("../middleware/upload.middleware");

// 👑 Admin & Manager can manage variants
router.post("/", auth, checkAbility("create", "variant"), upload.single("image"), createVariant);
router.put("/:id", auth, checkAbility("edit", "variant"), upload.single("image"), updateVariant);
router.delete("/:id", auth, checkAbility("delete", "variant"), deleteVariant);

// 👀 All roles can read
router.get("/", auth, checkAbility("read", "variant"), getVariants);

module.exports = router;