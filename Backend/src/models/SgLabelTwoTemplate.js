const mongoose = require('mongoose');

const sgLabelTwoTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  canvasWidth: {
    type: Number,
    required: true,
    default: 400
  },
  canvasHeight: {
    type: Number,
    required: true,
    default: 200
  },
  elements: [{
    id: { type: String, required: true },
    type: { type: String, required: true, enum: ['text', 'variable', 'barcode', 'image', 'shape'] },
    content: { type: String, default: '' },
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    width: { type: Number, required: true, default: 100 },
    height: { type: Number, required: true, default: 50 },
    fontSize: { type: Number, default: 14 },
    fontWeight: { type: String, default: 'normal' },
    fontFamily: { type: String, default: 'Arial' },
    textAlign: { type: String, default: 'left' },
    color: { type: String, default: '#000000' },
    rotation: { type: Number, default: 0 },
    zIndex: { type: Number, default: 1 }
  }],
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SgLabelTwoTemplate', sgLabelTwoTemplateSchema);
