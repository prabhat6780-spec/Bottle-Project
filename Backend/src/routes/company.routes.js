const router = require("express").Router();

const {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany
} = require("../controllers/company.controller");

const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post("/", auth, checkAbility("create", "company"), createCompany);
router.put("/:id", auth, checkAbility("edit", "company"), updateCompany);
router.delete("/:id", auth, checkAbility("delete", "company"), deleteCompany);

router.get("/", auth, checkAbility("read", "company"), getCompanies);

module.exports = router;
