const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/user");

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

    // ❌ optional: clear old users
    await User.deleteMany();

    // 🔐 hash passwords
    const users = await Promise.all(
      usersData.map(async (user) => ({
        email: user.email.toLowerCase(),
        password: await bcrypt.hash(user.password, 10),
        role: user.role
      }))
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