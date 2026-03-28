const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteTypes: [{
    type: {
      type: String,
      enum: ['plastic', 'paper', 'metal', 'ewaste', 'glass', 'batteries', 'textiles'],
      required: true
    },
    estimatedWeight: {
      type: Number,
      required: true,
      min: 0.1
    }
  }],
  totalEstimatedWeight: {
    type: Number,
    default: 0
  },
  totalEstimatedPoints: {
    type: Number,
    default: 0
  },
  address: {
    street: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    landmark: {
      type: String,
      default: ''
    }
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  specialInstructions: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'verified', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actualWeight: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  trackingCode: {
    type: String,
    unique: true,
    sparse: true
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  scheduledAt: {
    type: Date
  },
  pickedUpAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate tracking code before saving
pickupRequestSchema.pre('save', function(next) {
  if (!this.trackingCode) {
    const prefix = 'PK';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.trackingCode = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Indexes
pickupRequestSchema.index({ userId: 1, status: 1 });
pickupRequestSchema.index({ trackingCode: 1 }, { unique: true, sparse: true });
pickupRequestSchema.index({ status: 1 });

pickupRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);