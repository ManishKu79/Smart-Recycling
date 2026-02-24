// src/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Reward = require('../models/Reward');

const DEFAULT_REWARDS = [
  {
    name: 'Eco Shopping Bag',
    points: 500,
    description: 'Reusable shopping bag made from recycled materials',
    category: 'eco-products',
    stock: '45',
    icon: '🛍️'
  },
  {
    name: 'Coffee Shop Voucher',
    points: 750,
    description: '$10 voucher at Green Bean Cafe',
    category: 'vouchers',
    stock: '120',
    icon: '☕'
  },
  {
    name: 'Plant a Tree Certificate',
    points: 1000,
    description: 'We plant a tree in your name',
    category: 'eco-actions',
    stock: 'Unlimited',
    icon: '🌳'
  },
  {
    name: 'Reusable Water Bottle',
    points: 1200,
    description: 'Stainless steel insulated bottle',
    category: 'eco-products',
    stock: '28',
    icon: '💧'
  },
  {
    name: 'E-Book: Zero Waste Living',
    points: 300,
    description: 'Digital guide to sustainable living',
    category: 'education',
    stock: 'Unlimited',
    icon: '📚'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing rewards
    await Reward.deleteMany({});
    console.log('✅ Cleared existing rewards');

    // Insert default rewards
    await Reward.insertMany(DEFAULT_REWARDS);
    console.log('✅ Seeded default rewards');

    console.log('🎉 Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();