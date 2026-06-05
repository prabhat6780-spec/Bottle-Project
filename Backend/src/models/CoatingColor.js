const mongoose = require("mongoose");

const coatingColorSchema = new mongoose.Schema({
  coatingTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoatingType",
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

// Compound index to allow same color name for different coating types
coatingColorSchema.index({ coatingTypeId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("CoatingColor", coatingColorSchema);
