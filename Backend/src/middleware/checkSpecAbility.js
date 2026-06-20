const defineAbilityFor = require("../abilities/defineAbility");
const BottleSpec = require("../models/Bottlespecs");

const checkSpecAbility = (action) => {
  return async (req, res, next) => {
    try {
      const ability = defineAbilityFor(req.user);
      
      let subject = "bottlespec"; // Default subject

      if (req.method === "GET") {
        if (req.query.type === "coating") subject = "coatingspec";
      } else if (req.method === "POST") {
        if (req.body.isCoating === true || req.body.isCoating === 'true') {
          subject = "coatingspec";
        }
      } else if (req.method === "PUT" || req.method === "DELETE") {
        const id = req.params.id;
        if (id) {
          const spec = await BottleSpec.findById(id);
          if (spec && spec.isCoating) {
            subject = "coatingspec";
          }
        }
      }

      if (ability.can(action, subject)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
      });
    } catch (error) {
      console.error("Ability check error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during permission check",
      });
    }
  };
};

module.exports = checkSpecAbility;
