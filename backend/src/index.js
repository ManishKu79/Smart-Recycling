// src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const smartBinRoutes = require('./routes/smartBinRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recycleRoutes = require('./routes/recycleRoutes');
const rewardsRoutes = require('./routes/rewardsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const app = express();
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://smart-recycling-reward-system.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recycle', recycleRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smartbin', smartBinRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/collector', collectorRoutes);
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server error'
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    await createAdminUser();
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function createAdminUser() {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartrecycle.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
      
      await User.create({
        fullName: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        points: 1000000,
        isActive: true
      });
      
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}