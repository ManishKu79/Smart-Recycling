// src/controllers/rewardsController.js
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');

// Default rewards
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

// @desc    Get rewards catalog
// @route   GET /api/rewards/catalog
// @access  Private
const getCatalog = async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    
    // Check if rewards exist, if not seed default rewards
    const count = await Reward.countDocuments();
    if (count === 0) {
      await Reward.insertMany(DEFAULT_REWARDS);
    }

    // Query rewards
    const query = { isActive: true };
    if (category !== 'all') {
      query.category = category;
    }

    const rewards = await Reward.find(query).sort({ points: 1 });

    res.json({
      success: true,
      rewards
    });
  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get rewards' 
    });
  }
};

// @desc    Get user points
// @route   GET /api/rewards/points
// @access  Private
const getUserPoints = async (req, res) => {
  try {
    res.json({
      success: true,
      points: {
        balance: req.user.points,
        totalEarned: req.user.points - 100, // Subtract welcome bonus
        welcomeBonus: 100
      }
    });
  } catch (error) {
    console.error('Points error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get points' 
    });
  }
};

// @desc    Redeem reward
// @route   POST /api/rewards/redeem
// @access  Private
const redeemReward = async (req, res) => {
  try {
    const { rewardId, quantity = 1 } = req.body;

    // Get reward
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reward not found' 
      });
    }

    // Check if reward is active
    if (!reward.isActive) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reward is not available' 
      });
    }

    // Check points
    const totalPointsNeeded = reward.points * quantity;
    if (req.user.points < totalPointsNeeded) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient points. Need ${totalPointsNeeded} points` 
      });
    }

    // Check stock
    if (reward.stock !== 'Unlimited') {
      const stock = parseInt(reward.stock);
      if (stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock. Only ${stock} available` 
        });
      }
    }

    // Create redemption
    const redemption = await Redemption.create({
      userId: req.user.id,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsSpent: totalPointsNeeded,
      quantity
    });

    // Deduct points from user
    req.user.points -= totalPointsNeeded;
    await req.user.save();

    // Update stock if not unlimited
    if (reward.stock !== 'Unlimited') {
      const newStock = parseInt(reward.stock) - quantity;
      reward.stock = newStock.toString();
      await reward.save();
    }

    res.json({
      success: true,
      redemption,
      message: `Successfully redeemed ${reward.name}`
    });
  } catch (error) {
    console.error('Redemption error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to redeem reward' 
    });
  }
};

// @desc    Get user redemption history
// @route   GET /api/rewards/history
// @access  Private
const getRedemptionHistory = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      redemptions
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get redemption history' 
    });
  }
};

module.exports = {
  getCatalog,
  getUserPoints,
  redeemReward,
  getRedemptionHistory
};