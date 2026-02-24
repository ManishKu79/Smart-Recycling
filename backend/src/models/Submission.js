// src/models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['plastic', 'paper', 'metal', 'ewaste', 'glass', 'batteries', 'textiles'],
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: [0.1, 'Weight must be at least 0.1 kg'],
    max: [1000, 'Weight cannot exceed 1000 kg']
  },
  pointsEarned: {
    type: Number,
    required: true
  },
  co2Saved: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  imageUrl: {
    type: String
  },
  aiDetectionResults: [{
    wasteType: String,
    confidence: Number,
    boundingBox: [Number],
    estimatedWeight: Number
  }],
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ wasteType: 1 });

// Remove version from JSON
submissionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Submission', submissionSchema);