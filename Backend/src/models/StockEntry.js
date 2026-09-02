const mongoose = require("mongoose");

const stockEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: "",
    },
    // Only for IN (Invoice-based)
    invoiceNumber: {
      type: String,
      default: null,
    },
    supplierName: {
      type: String,
      default: null,
    },
    invoiceFileUrl: {
      type: String,
      default: null,
    },
    // Array of raw materials and quantities
    items: [
      {
        rawMaterialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterial",
          required: true,
        },
        descriptionOfGoods: {
          type: String,
          default: "",
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          default: 0,
        },
        per: {
          type: String,
          default: "",
        },
        amount: {
          type: Number,
          default: 0,
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockEntry", stockEntrySchema);
