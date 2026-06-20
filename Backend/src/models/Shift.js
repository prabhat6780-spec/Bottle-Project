const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // unique: true
  },
  status: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Shift", shiftSchema);
