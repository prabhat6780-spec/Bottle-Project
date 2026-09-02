const mongoose = require('mongoose');

const FormulaSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  bottleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BottleSpec',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant',
    required: true,
  },
  coatingTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoatingType',
    required: true,
  },
  columns: [{
    columnName: {
      type: String,
      trim: true,
      default: ''
    },
    rawMaterials: [{
      rawMaterialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RawMaterial'
      },
      quantity: {
        type: String,
        trim: true
      }
    }]
  }],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Formula', FormulaSchema);
