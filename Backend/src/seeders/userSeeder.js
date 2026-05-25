const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/user");
const Role = require("../models/role.model");
const seedRBAC = require("./rbac.seeder");

// ✅ ALL USERS HERE 👇
const usersData = [
  {
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin"
  },
  {
    email: "manager1@gmail.com",
    password: "manager123",
    role: "manager"
  },
  {
    email: "operator1@gmail.com",
    password: "operator123",
    role: "operator"
  },
  {
    email: "operator2@gmail.com",
    password: "operator123",
    role: "operator"
  },
  {
    email: "operator3@gmail.com",
    password: "operator123",
    role: "operator"
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");

    // Ensure Roles and Permissions exist
    await seedRBAC();

    // ❌ optional: clear old users
    await User.deleteMany();

    // Fetch all roles to map strings to ObjectIds
    const roles = await Role.find();

    // 🔐 hash passwords
    const users = await Promise.all(
      usersData.map(async (user) => {
        const matchedRole = roles.find(
          (r) => r.name.toLowerCase() === user.role.toLowerCase()
        );
        return {
          email: user.email.toLowerCase(),
          password: await bcrypt.hash(user.password, 10),
          role: matchedRole ? matchedRole._id : null
        };
      })
    );

    // ✅ insert all users
    await User.insertMany(users);

    console.log("All Users Seeded ✅");
    process.exit();

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seedUsers();