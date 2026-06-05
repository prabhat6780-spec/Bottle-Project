const router = require("express").Router();
const {
  createCoatingColor,
  getCoatingColors,
  updateCoatingColor,
  deleteCoatingColor
} = require("../controllers/coatingColor.controller");
const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility("create", "coating-color"), createCoatingColor);
router.put("/:id", auth, checkAbility("edit", "coating-color"), updateCoatingColor);
router.delete("/:id", auth, checkAbility("delete", "coating-color"), deleteCoatingColor);
router.get("/", auth, checkAbility("read", "coating-color"), getCoatingColors);

module.exports = router;
