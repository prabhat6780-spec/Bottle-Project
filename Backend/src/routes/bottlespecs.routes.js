const router = require("express").Router();

const {
  createSpec,
  getSpecs,
  updateSpec,
  deleteSpec,
  getCoatingShades,
  getBottleNames,
  getBottleCodes,
  migrateFlags
} = require("../controllers/bottlespecs.controller");

const { auth } = require("../middleware/auth.middleware");
const checkSpecAbility = require("../middleware/checkSpecAbility");
const upload = require("../middleware/upload.middleware");

// Admin & Manager can manage specs
router.post("/", auth, upload.single("image"), checkSpecAbility("create"), createSpec);
router.put("/:id", auth, upload.single("image"), checkSpecAbility("edit"), updateSpec);
router.delete("/:id", auth, checkSpecAbility("delete"), deleteSpec);

router.get("/shades", auth, getCoatingShades);
router.get("/bottle-names", auth, getBottleNames);
router.get("/bottle-codes", auth, getBottleCodes);

// One-time migration: backfill isPrinting=true on old records
router.post("/migrate-flags", auth, migrateFlags);

// All roles can read
router.get("/", auth, checkSpecAbility("read"), getSpecs);

module.exports = router;