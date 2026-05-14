const User = require("../models/user");
const bcrypt = require("bcryptjs");

// ✅ CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      role,
      name
    });

    res.json(user);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate({
      path: "role",
      populate: {
        path: "permissions"
      }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE USER
exports.updateUser = async (req, res) => {
  try {

    const { id } = req.params;

    const data = req.body;

    // if password updated → hash, otherwise remove it from data to prevent overwriting with empty
    if (data.password && data.password.trim() !== '') {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    const user = await User.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: "after",
      }
    );

    res.json(user);

  } catch (err) {

    res.status(500).json(err.message);

  }
};

// ✅ DELETE USER
exports.deleteUser = async (req, res) => {
  try {

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: "User Deleted" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};


exports.getUserById = async (req, res) => {

  try {

    const user = await User.findById(
      req.params.id
    ).populate({
      path: "role",
      populate: {
        path: "permissions"
      }
    });

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};