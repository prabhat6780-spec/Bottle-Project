const mongoose = require("mongoose");

const sgLabelSchema = new mongoose.Schema({
  bottleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BottleSpec",
    required: true
  },
  coatingShade: {
    type: String,
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true
  },
  detectedTextColor: {
    type: String,
    default: null
  },
  customBottleName: {
    type: String,
    default: null
  },
  customBrandName: {
    type: String,
    default: null
  },
  customVariantName: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("SgLabel", sgLabelSchema);
