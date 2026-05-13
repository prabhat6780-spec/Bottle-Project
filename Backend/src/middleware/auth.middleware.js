const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, "SECRET_KEY");

    // Fetch full user with role and permissions from DB
    // This keeps the cookie small while ensuring RBAC has all the data it needs
    const user = await User.findById(decoded.id).populate({
      path: "role",
      populate: {
        path: "permissions"
      }
    });

    if (!user) {
      return res.status(401).json({ msg: "User no longer exists" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ msg: "Account deactivated" });
    }

    req.user = user;
    next();

  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};

exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = typeof req.user.role === 'object' ? req.user.role.name : req.user.role;

    // Case-insensitive check
    const hasRole = roles.some(role => role.toLowerCase() === (userRole || '').toLowerCase());

    if (!hasRole) {
      return res.status(403).json({ msg: "Access Denied" });
    }
    next();
  };
};