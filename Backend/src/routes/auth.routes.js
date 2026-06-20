const router = require("express").Router();
const { login, logout, changePassword } = require("../controllers/login");
const { auth } = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/logout", logout);
router.put("/change-password", auth, changePassword);

module.exports = router;