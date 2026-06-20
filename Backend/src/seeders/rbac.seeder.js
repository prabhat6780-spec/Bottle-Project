const Permission = require("../models/permission.model");
const Role = require("../models/role.model");

const seedRBAC = async () => {
  try {
    // 1. Define Default Permissions
    const permissionsData = [
      "create-user", "edit-user", "delete-user", "show-user", "sidebar-user", "read-user",
      "sidebar-dashboard", "read-dashboard",
      "create-brand", "edit-brand", "delete-brand", "sidebar-brand", "read-brand",
      "create-bottlespec", "edit-bottlespec", "delete-bottlespec", "sidebar-bottlespec", "read-bottlespec", "read-bottlespecdetail",
      "create-variant", "edit-variant", "delete-variant", "sidebar-variant", "read-variant",
      "create-production", "edit-production", "delete-production", "sidebar-production", "read-production", "read-productiondetail",
      "create-coatingproduction", "edit-coatingproduction", "delete-coatingproduction", "sidebar-coatingproduction", "read-coatingproduction", "read-coatingproductiondetail",
      "create-coatingspec", "edit-coatingspec", "delete-coatingspec", "sidebar-coatingspec", "read-coatingspec",
      "create-role", "edit-role", "delete-role", "sidebar-role", "read-role",
      "create-permission", "edit-permission", "delete-permission", "sidebar-permission", "read-permission",
      "create-printing-type", "edit-printing-type", "delete-printing-type", "sidebar-printing-type", "read-printing-type",
      "create-printing-color", "edit-printing-color", "delete-printing-color", "sidebar-printing-color", "read-printing-color",
      "create-coating-type", "edit-coating-type", "delete-coating-type", "sidebar-coating-type", "read-coating-type",
      "create-company", "edit-company", "delete-company", "sidebar-company", "read-company",
      "create-operator", "edit-operator", "delete-operator", "sidebar-operator", "read-operator",
      "create-shift", "edit-shift", "delete-shift", "sidebar-shift", "read-shift",
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
          "sidebar-dashboard", "read-dashboard",
          "show-user", "sidebar-user", "read-user",
          "create-brand", "edit-brand", "sidebar-brand", "read-brand", "read-company",
          "create-bottlespec", "edit-bottlespec", "sidebar-bottlespec", "read-bottlespec", "read-bottlespecdetail",
          "read-printing-type", "read-printing-color", "read-coating-type",
          "create-variant", "edit-variant", "sidebar-variant", "read-variant",
          "create-production", "edit-production", "sidebar-production", "read-production", "read-productiondetail", "use-vision",
          "create-coatingproduction", "edit-coatingproduction", "sidebar-coatingproduction", "read-coatingproduction", "read-coatingproductiondetail",
          "create-coatingspec", "edit-coatingspec", "sidebar-coatingspec", "read-coatingspec"
        ]
      },
      {
        name: "Operator",
        permissionNames: [
          "sidebar-dashboard", "read-dashboard",
          "sidebar-brand", "read-brand", "read-company",
          "sidebar-bottlespec", "read-bottlespec",
          "read-printing-type", "read-printing-color", "read-coating-type",
          "sidebar-variant", "read-variant",
          "sidebar-production", "read-production", "create-production", "use-vision",
          "sidebar-coatingproduction", "read-coatingproduction", "create-coatingproduction",
          "sidebar-coatingspec", "read-coatingspec",
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
      } else {
        // Update or create the role with default base permissions
        if (existingRole) {
          // Merge existing permissions with the required ones to avoid losing UI changes, 
          // but for simplicity right now, we will just ensure the base ones are added.
          const existingIds = existingRole.permissions.map(p => p.toString());
          const newIds = rolePermissions.map(p => p.toString());
          const mergedIds = [...new Set([...existingIds, ...newIds])];
          
          await Role.findByIdAndUpdate(existingRole._id, { permissions: mergedIds });
        } else {
          await Role.create({
            name: roleData.name,
            permissions: rolePermissions
          });
        }
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
    
    // 4. Seed Default Printing Types
    const PrintingType = require("../models/PrintingType");
    const defaultTypes = ["Foil", "Organic"];
    for (const name of defaultTypes) {
      const exists = await PrintingType.findOne({ name });
      if (!exists) {
        await PrintingType.create({ name, status: true });
        console.log(`Created default printing type: ${name}`);
      }
    }

    console.log("RBAC Seeding and Migration completed successfully!");
  } catch (error) {
    console.error("RBAC Seeding failed:", error);
  }
};

module.exports = seedRBAC;
