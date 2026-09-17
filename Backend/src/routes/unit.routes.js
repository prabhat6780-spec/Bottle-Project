const express = require("express");
const router = express.Router();
const { addUnit, getAllUnits, getSingleUnit, updateUnit, deleteUnit } = require("../controllers/unit.controller");
const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility('create', 'unit'), addUnit);
router.get("/", auth, checkAbility('read', 'unit'), getAllUnits);
router.get("/:id", auth, checkAbility('read', 'unit'), getSingleUnit);
router.put("/:id", auth, checkAbility('edit', 'unit'), updateUnit);
router.delete("/:id", auth, checkAbility('delete', 'unit'), deleteUnit);

module.exports = router;
