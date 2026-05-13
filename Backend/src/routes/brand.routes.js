const router = require("express").Router();

const {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand
} = require("../controllers/brand.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

// 👑 Granular RBAC
router.post("/", auth, checkAbility("create", "brand"), createBrand);
router.put("/:id", auth, checkAbility("edit", "brand"), updateBrand);
router.delete("/:id", auth, checkAbility("delete", "brand"), deleteBrand);

// 👀 All roles
router.get("/", auth, checkAbility("read", "brand"), getBrands);

module.exports = router;