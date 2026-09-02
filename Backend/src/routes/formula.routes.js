const express = require("express");
const router = express.Router();
const formulaController = require("../controllers/formula.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility("create", "formula"), formulaController.createFormula);
router.get("/", auth, checkAbility("read", "formula"), formulaController.getFormulas);
router.get("/:id", auth, checkAbility("read", "formula"), formulaController.getFormulaById);
router.put("/:id", auth, checkAbility("edit", "formula"), formulaController.updateFormula);
router.patch("/:id/toggle-status", auth, checkAbility("edit", "formula"), formulaController.toggleStatus);
router.delete("/:id", auth, checkAbility("delete", "formula"), formulaController.deleteFormula);

module.exports = router;
