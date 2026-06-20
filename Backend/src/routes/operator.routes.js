const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operator.controller");

router.post("/", operatorController.createOperator);
router.get("/", operatorController.getOperators);
router.put("/:id", operatorController.updateOperator);
router.delete("/:id", operatorController.deleteOperator);

module.exports = router;
