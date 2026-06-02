const mongoose = require("mongoose");

const bottleSpecSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },

  bottleName: {
    type: String,
    required: true
  },

  code: {
    type: String,   // e.g. Q20
  },

  printingTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrintingType",
    required: true
  },

  printingColorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrintingColor",
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

module.exports = mongoose.model("BottleSpec", bottleSpecSchema);