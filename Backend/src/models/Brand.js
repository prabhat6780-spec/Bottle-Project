const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  name: {
    type: String,
    required: true
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

brandSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Brand", brandSchema);