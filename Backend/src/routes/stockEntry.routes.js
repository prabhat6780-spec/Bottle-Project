const express = require("express");
const router = express.Router();
const stockEntryController = require("../controllers/stockEntry.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility("create", "stock_entry"), stockEntryController.addEntry);
router.get("/invoices", auth, checkAbility("read", "stock_entry"), stockEntryController.getInvoices);
router.get("/summary", auth, checkAbility("read", "stock_entry"), stockEntryController.getSummary);
router.get("/history/:rawMaterialId", auth, checkAbility("ledger", "stock_entry"), stockEntryController.getHistory);
router.get("/:id", auth, checkAbility("read", "stock_entry"), stockEntryController.getSingleEntry);
router.put("/:id", auth, checkAbility("edit", "stock_entry"), stockEntryController.updateEntry);
router.delete("/:id", auth, checkAbility("delete", "stock_entry"), stockEntryController.deleteEntry);

module.exports = router;
