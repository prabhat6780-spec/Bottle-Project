const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permission.controller");
const { auth: protect } = require("../middleware/auth.middleware");
const checkAbility = require("../middleware/checkAbility");

router.post(
  "/",
  protect,
  checkAbility("create", "permission"),
  permissionController.createPermission
);

router.get(
  "/",
  protect,
  checkAbility("read", "permission"),
  permissionController.getAllPermissions
);

router.get(
  "/:id",
  protect,
  checkAbility("read", "permission"),
  permissionController.getPermission
);

router.put(
  "/:id",
  protect,
  checkAbility("edit", "permission"),
  permissionController.updatePermission
);

router.delete(
  "/:id",
  protect,
  checkAbility("delete", "permission"),
  permissionController.deletePermission
);

module.exports = router;
