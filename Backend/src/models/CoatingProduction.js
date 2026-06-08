const mongoose = require("mongoose");

const coatingProductionSchema = new mongoose.Schema({
  unit: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
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
  operatorName: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  actualQuantity: {
    type: Number,
    required: true,
  },
  rejectionQuantity: {
    type: Number,
    required: true,
  },
  totalActualCoatedBottle: {
    type: Number,
    required: true,
  },
  totalBottleCoated: {
    type: Number,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("CoatingProduction", coatingProductionSchema);
