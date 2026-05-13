const defineAbilityFor = require("../abilities/defineAbility");

const checkAbility = (action, subject) => {
  return (req, res, next) => {
    const ability = defineAbilityFor(req.user);

    if (ability.can(action, subject)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You don't have permission to perform this action",
    });
  };
};

module.exports = checkAbility;
