// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 100
  },
  totalRecycled: {
    type: Number,
    default: 0
  },
  carbonSaved: {
    type: Number,
    default: 0
  },
  treesSaved: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'collector'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedZone: {
    type: String,
    default: ''
  },
  totalPickupsCompleted: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateStreak = async function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActive = new Date(this.lastActive).setHours(0, 0, 0, 0);
  
  if (today > lastActive) {
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.streak += 1;
    } else if (diffDays > 1) {
      this.streak = 1;
    }
  }
  
  this.lastActive = new Date();
  await this.save();
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);