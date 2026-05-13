const express = require("express");
const router = express.Router();

const {
  addProduction,
  getAllProduction,
  getProductionById,
  updateProduction,
  deleteProduction,
} = require("../controllers/production.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

// ➤ CREATE (operator can also add production)
router.post("/", auth, checkAbility("create", "production"), addProduction);

// ➤ READ (all roles)
router.get("/", auth, checkAbility("read", "production"), getAllProduction);
router.get("/:id", auth, checkAbility("read", "production"), getProductionById);

// ➤ UPDATE (manager + admin)
router.put("/:id", auth, checkAbility("edit", "production"), updateProduction);

// ➤ DELETE (only admin)
router.delete("/:id", auth, checkAbility("delete", "production"), deleteProduction);

module.exports = router;