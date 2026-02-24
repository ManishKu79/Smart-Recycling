// src/models/Reward.js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Reward name is required'],
    trim: true
  },
  points: {
    type: Number,
    required: [true, 'Points required is required'],
    min: [1, 'Points must be at least 1']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['eco-products', 'vouchers', 'eco-actions', 'education'],
    required: true
  },
  stock: {
    type: String,
    default: 'Unlimited'
  },
  icon: {
    type: String,
    default: '🎁'
  },
  imageUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
rewardSchema.index({ points: 1 });
rewardSchema.index({ category: 1 });

// Remove version from JSON
rewardSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Reward', rewardSchema);