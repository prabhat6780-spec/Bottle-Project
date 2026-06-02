const mongoose = require("mongoose");

const printingColorSchema = new mongoose.Schema({
  printingTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrintingType",
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

// Compound index to allow same color name for different printing types
printingColorSchema.index({ printingTypeId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("PrintingColor", printingColorSchema);
