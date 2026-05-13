const Permission = require("../models/permission.model");
const Role = require("../models/role.model");

const seedRBAC = async () => {
  try {
    // 1. Define Default Permissions
    const permissionsData = [
      "create-user", "edit-user", "delete-user", "show-user", "sidebar-user", "read-user",
      "create-brand", "edit-brand", "delete-brand", "sidebar-brand", "read-brand",
      "create-bottlespec", "edit-bottlespec", "delete-bottlespec", "sidebar-bottlespec", "read-bottlespec",
      "create-production", "edit-production", "delete-production", "sidebar-production", "read-production",
      "create-role", "edit-role", "delete-role", "sidebar-role", "read-role",
      "create-permission", "edit-permission", "delete-permission", "sidebar-permission", "read-permission",
      "use-vision", "manage-all"
    ];

    // Create permissions if they don't exist
    const permissions = await Promise.all(
      permissionsData.map(async (name) => {
        let p = await Permission.findOne({ name });
        if (!p) {
          p = await Permission.create({ name });
        }
        return p;
      })
    );

    // 2. Define Roles
    const dbPermissions = await Permission.find();
    const allPermissionIds = dbPermissions.map(p => p._id);
    const rolesData = [
      {
        name: "Admin",
        permissionIds: allPermissionIds // All permissions
      },
      {
        name: "Manager",
        permissionNames: [
          "show-user", "sidebar-user", "read-user",
          "create-brand", "edit-brand", "sidebar-brand", "read-brand",
          "create-bottlespec", "edit-bottlespec", "sidebar-bottlespec", "read-bottlespec",
          "create-production", "edit-production", "sidebar-production", "read-production", "use-vision"
        ]
      },
      {
        name: "Operator",
        permissionNames: [
          "sidebar-brand", "read-brand",
          "sidebar-bottlespec", "read-bottlespec",
          "sidebar-production", "read-production", "create-production", "use-vision",
          "show-user", "read-user"
        ]
      }
    ];

    // Create roles
    for (const roleData of rolesData) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      let rolePermissions = [];
      if (roleData.permissionIds) {
        rolePermissions = roleData.permissionIds;
      } else {
        rolePermissions = dbPermissions.filter(p => roleData.permissionNames.includes(p.name)).map(p => p._id);
      }

      if (roleData.name === "Admin") {
        // Always update Admin to ensure it has all permissions
        await Role.findOneAndUpdate(
          { name: "Admin" },
          { name: "Admin", permissions: rolePermissions },
          { upsert: true, returnDocument: 'after' }
        );
      } else if (!existingRole) {
        // Only create other roles if they don't exist
        await Role.create({
          name: roleData.name,
          permissions: rolePermissions
        });
      }
    }

    // 3. Migrate existing users
    const User = require("../models/user");
    const allUsers = await User.find();
    const allRoles = await Role.find();

    for (const user of allUsers) {
      if (typeof user.role === "string") {
        const matchingRole = allRoles.find(r => r.name.toLowerCase() === user.role.toLowerCase());
        if (matchingRole) {
          user.role = matchingRole._id;
          await user.save();
          console.log(`Migrated user ${user.email} to role ${matchingRole.name}`);
        }
      }
    }

    console.log("RBAC Seeding and Migration completed successfully!");
  } catch (error) {
    console.error("RBAC Seeding failed:", error);
  }
};

module.exports = seedRBAC;
