const mongoose = require('mongoose');

const smartBinCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  wasteType: {
    type: String,
    enum: ['plastic', 'paper', 'metal', 'ewaste', 'glass', 'batteries', 'textiles'],
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0.1
  },
  pointsValue: {
    type: Number,
    required: true
  },
  co2Saved: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired'],
    default: 'active'
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redeemedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

smartBinCodeSchema.index({ code: 1 }, { unique: true });
smartBinCodeSchema.index({ status: 1 });
smartBinCodeSchema.index({ expiresAt: 1 });

smartBinCodeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('SmartBinCode', smartBinCodeSchema);