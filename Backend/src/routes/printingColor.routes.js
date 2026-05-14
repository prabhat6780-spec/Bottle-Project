const router = require("express").Router();
const {
  createPrintingColor,
  getPrintingColors,
  updatePrintingColor,
  deletePrintingColor
} = require("../controllers/printingColor.controller");
const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility("create", "printing-color"), createPrintingColor);
router.put("/:id", auth, checkAbility("edit", "printing-color"), updatePrintingColor);
router.delete("/:id", auth, checkAbility("delete", "printing-color"), deletePrintingColor);
router.get("/", auth, checkAbility("read", "printing-color"), getPrintingColors);

module.exports = router;
