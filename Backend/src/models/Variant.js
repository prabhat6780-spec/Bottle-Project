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

  variantType: {
    type: String,
    required: true
  },

  variantSize: {
    type: String,
    required: true
  },

  status: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Variant", variantSchema);