const router = require("express").Router();
const {
  createPrintingType,
  getPrintingTypes,
  updatePrintingType,
  deletePrintingType
} = require("../controllers/printingType.controller");
const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility("create", "printing-type"), createPrintingType);
router.put("/:id", auth, checkAbility("edit", "printing-type"), updatePrintingType);
router.delete("/:id", auth, checkAbility("delete", "printing-type"), deletePrintingType);
router.get("/", auth, checkAbility("read", "printing-type"), getPrintingTypes);

module.exports = router;
