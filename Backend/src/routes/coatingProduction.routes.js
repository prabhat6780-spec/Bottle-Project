const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

const {
  addProduction,
  getAllProduction,
  getSingleProduction,
  updateProduction,
  deleteProduction,
} = require("../controllers/coatingProduction.controller");

router.post("/", auth, checkAbility('create', 'coatingproduction'), addProduction);
router.get("/", auth, checkAbility('read', 'coatingproduction'), getAllProduction);
router.get("/:id", auth, checkAbility('read', 'coatingproductiondetail'), getSingleProduction);
router.put("/:id", auth, checkAbility('edit', 'coatingproduction'), updateProduction);
router.patch("/:id", auth, checkAbility('edit', 'coatingproduction'), updateProduction);
router.delete("/:id", auth, checkAbility('delete', 'coatingproduction'), deleteProduction);

module.exports = router;
