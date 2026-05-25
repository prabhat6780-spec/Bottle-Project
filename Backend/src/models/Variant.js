const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  bottleSpecId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BottleSpec",
    required: true
  },

  productName: {
    type: String,
    required: true
  },

  variantName: {
    type: String,
    required: true
  },



  variantSize: {
    type: String
  },

  coatingShade: {
    type: String,
    trim: true
  },

  image: {
    type: String
  },

  status: {
    type: Boolean,
    default: true
  },

  detectedTextColor: {
    type: String,
    default: "Not Detected"
  }

}, { timestamps: true });

module.exports = mongoose.model("Variant", variantSchema);