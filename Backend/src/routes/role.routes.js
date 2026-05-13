const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { auth: protect } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post(
  "/",
  protect,
  checkAbility("create", "role"),
  roleController.createRole
);

router.get(
  "/",
  protect,
  checkAbility("read", "role"),
  roleController.getAllRoles
);

router.get(
  "/:id",
  protect,
  checkAbility("read", "role"),
  roleController.getRole
);

router.put(
  "/:id",
  protect,
  checkAbility("edit", "role"),
  roleController.updateRole
);

router.delete(
  "/:id",
  protect,
  checkAbility("delete", "role"),
  roleController.deleteRole
);

module.exports = router;
