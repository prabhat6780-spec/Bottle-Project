const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },

  bottleSpecId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BottleSpec",
    required: true,
  },

  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  totalPrinted: {
    type: Number,
    required: true,
  },

  bottlePerBox: {
    type: Number,
    default: 50,
  },

  totalBoxes: Number,
  remainingBottles: Number,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


module.exports = mongoose.model("Production", productionSchema);