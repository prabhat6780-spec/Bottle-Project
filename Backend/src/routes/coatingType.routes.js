const router = require("express").Router();
const {
  createCoatingType,
  getCoatingTypes,
  updateCoatingType,
  deleteCoatingType
} = require("../controllers/coatingType.controller");
const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility("create", "coating-type"), createCoatingType);
router.put("/:id", auth, checkAbility("edit", "coating-type"), updateCoatingType);
router.delete("/:id", auth, checkAbility("delete", "coating-type"), deleteCoatingType);
router.get("/", auth, checkAbility("read", "coating-type"), getCoatingTypes);

module.exports = router;
