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
    required: true
  },

  printingType: {
    type: String,
    required: true,
    trim: true
  },

  printingSubType: {
    type: String // color
  },

  status: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("BottleSpec", bottleSpecSchema);