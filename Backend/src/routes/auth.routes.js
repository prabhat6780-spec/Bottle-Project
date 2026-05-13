const router = require("express").Router();
const { login, logout, changePassword } = require("../controllers/Login");
const { auth } = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/logout", logout);
router.put("/change-password", auth, changePassword);

module.exports = router;