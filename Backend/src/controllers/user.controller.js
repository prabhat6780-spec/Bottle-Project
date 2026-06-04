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

// ✅ GET ALL USERS (Backend Pagination + Search + Filter)

exports.getUsers = async (req, res) => {

  try {

    const {

      page = 1,

      limit = 10,

      search = "",

      status = "all",

      sortKey = "name",

      sortDirection = "asc",

    } = req.query;

    const parsedPage =
      parseInt(page);

    const parsedLimit =
      parseInt(limit);

    const skip =
      (parsedPage - 1) * parsedLimit;

    let filter = {

      isDeleted: {
        $ne: true,
      },

    };

    // STATUS FILTER
    if (
      status &&
      status !== "all"
    ) {

      filter.status = status;

    }

    // SEARCH
    if (search) {

      filter.$or = [

        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

      ];

    }

    // SORT
    let sort = {};

    if (sortKey === "role") {

      sort["role.name"] =
        sortDirection === "asc"
          ? 1
          : -1;

    } else {

      sort[sortKey] =
        sortDirection === "asc"
          ? 1
          : -1;

    }

    const users =
      await User.find(filter)

        .select("-password")

        .populate({

          path: "role",

          populate: {
            path: "permissions",
          },

        })

        .sort(sort)

        .skip(skip)

        .limit(parsedLimit);

    const total =
      await User.countDocuments(
        filter
      );

    res.json({

      success: true,

      data: users,

      page: parsedPage,

      totalPages:
        Math.ceil(
          total / parsedLimit
        ),

      total,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

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

    await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

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