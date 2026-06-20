const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shift.controller");

router.post("/", shiftController.createShift);
router.get("/", shiftController.getShifts);
router.put("/:id", shiftController.updateShift);
router.delete("/:id", shiftController.deleteShift);

module.exports = router;
