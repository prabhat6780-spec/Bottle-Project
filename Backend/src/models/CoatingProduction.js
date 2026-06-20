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
  coatingSpecId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BottleSpec",
    required: true,
  },
  coatingShade: {
    type: String,
    required: true,
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift",
    required: true,
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Operator",
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

bottlePerBox: {
  type: Number,
  required: true,
},

rejectionReason: {
  type: String,
  default: "",
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
