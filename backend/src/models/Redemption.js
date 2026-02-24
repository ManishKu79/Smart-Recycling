// src/models/Redemption.js
const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  rewardName: {
    type: String,
    required: true
  },
  pointsSpent: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  redemptionCode: {
    type: String,
    unique: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate redemption code before saving
redemptionSchema.pre('save', function(next) {
  if (!this.redemptionCode) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.redemptionCode = `RWD-${timestamp}-${random}`;
  }
  
  if (!this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Indexes
redemptionSchema.index({ userId: 1, createdAt: -1 });
redemptionSchema.index({ redemptionCode: 1 }, { unique: true });

// Remove version from JSON
redemptionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Redemption', redemptionSchema);