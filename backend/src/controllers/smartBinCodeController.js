const SmartBinCode = require('../models/SmartBinCode');
const User = require('../models/User');
const Submission = require('../models/Submission');

const POINTS_PER_KG = {
  plastic: 10,
  paper: 8,
  metal: 25,
  ewaste: 100,
  glass: 5,
  batteries: 150,
  textiles: 7
};

const CO2_PER_KG = {
  plastic: 0.5,
  paper: 0.3,
  metal: 1.2,
  ewaste: 2.5,
  glass: 0.2,
  batteries: 3.0,
  textiles: 0.4
};

// Helper function to generate a unique code (renamed to avoid conflict)
function generateUniqueCode() {
  const prefix = 'SR';
  const random1 = Math.random().toString(36).substring(2, 7).toUpperCase();
  const random2 = Math.random().toString(36).substring(2, 7).toUpperCase();
  const random3 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}-${random1}-${random2}-${random3}`;
}

// @desc    Generate code from smart bin simulator
// @route   POST /api/smartbin/generate
// @access  Public
const generateCode = async (req, res) => {
  try {
    const { wasteType, weight } = req.body;

    if (!wasteType || !weight) {
      return res.status(400).json({
        success: false,
        error: 'Please provide wasteType and weight'
      });
    }

    if (weight < 0.1 || weight > 50) {
      return res.status(400).json({
        success: false,
        error: 'Weight must be between 0.1kg and 50kg'
      });
    }

    const pointsValue = Math.round(weight * POINTS_PER_KG[wasteType]);
    const co2Saved = Math.round(weight * CO2_PER_KG[wasteType] * 10) / 10;

    let code = generateUniqueCode();
    let existing = await SmartBinCode.findOne({ code });
    
    while (existing) {
      code = generateUniqueCode();
      existing = await SmartBinCode.findOne({ code });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const smartBinCode = await SmartBinCode.create({
      code,
      wasteType,
      weight,
      pointsValue,
      co2Saved,
      expiresAt
    });

    res.status(201).json({
      success: true,
      data: {
        code: smartBinCode.code,
        pointsValue: smartBinCode.pointsValue,
        wasteType: smartBinCode.wasteType,
        weight: smartBinCode.weight,
        co2Saved: smartBinCode.co2Saved,
        expiresAt: smartBinCode.expiresAt
      }
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate code'
    });
  }
};

// @desc    Verify code before redemption
// @route   POST /api/smartbin/verify
// @access  Private
const verifyCode = async (req, res) => {
  try {
    const { code } = req.body;

    const smartBinCode = await SmartBinCode.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (!smartBinCode) {
      return res.json({
        success: true,
        valid: false,
        message: 'Invalid code'
      });
    }
    
    if (smartBinCode.status === 'redeemed') {
      return res.json({
        success: true,
        valid: false,
        message: 'This code has already been redeemed'
      });
    }
    
    if (smartBinCode.expiresAt < new Date()) {
      smartBinCode.status = 'expired';
      await smartBinCode.save();
      return res.json({
        success: true,
        valid: false,
        message: 'This code has expired'
      });
    }
    
    res.json({
      success: true,
      valid: true,
      data: {
        pointsValue: smartBinCode.pointsValue,
        wasteType: smartBinCode.wasteType,
        weight: smartBinCode.weight,
        expiresAt: smartBinCode.expiresAt
      }
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify code'
    });
  }
};

// @desc    Redeem code (user enters on main website)
// @route   POST /api/smartbin/redeem
// @access  Private
const redeemCode = async (req, res) => {
  try {
    const { code } = req.body;

    const smartBinCode = await SmartBinCode.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (!smartBinCode) {
      return res.status(404).json({
        success: false,
        error: 'Invalid code'
      });
    }
    
    if (smartBinCode.status === 'redeemed') {
      return res.status(400).json({
        success: false,
        error: 'Code already redeemed'
      });
    }
    
    if (smartBinCode.expiresAt < new Date()) {
      smartBinCode.status = 'expired';
      await smartBinCode.save();
      return res.status(400).json({
        success: false,
        error: 'Code expired'
      });
    }
    
    smartBinCode.status = 'redeemed';
    smartBinCode.redeemedBy = req.user.id;
    smartBinCode.redeemedAt = new Date();
    await smartBinCode.save();
    
    const user = await User.findById(req.user.id);
    user.points += smartBinCode.pointsValue;
    user.totalRecycled += smartBinCode.weight;
    user.carbonSaved += smartBinCode.co2Saved;
    user.treesSaved = Math.floor(user.carbonSaved / 20);
    await user.save();
    
    await Submission.create({
      userId: req.user.id,
      wasteType: smartBinCode.wasteType,
      weight: smartBinCode.weight,
      pointsEarned: smartBinCode.pointsValue,
      co2Saved: smartBinCode.co2Saved,
      status: 'approved',
      approvedAt: new Date(),
      description: `Redeemed from smart bin code: ${smartBinCode.code}`
    });
    
    res.json({
      success: true,
      data: {
        pointsEarned: smartBinCode.pointsValue,
        wasteType: smartBinCode.wasteType,
        weight: smartBinCode.weight,
        co2Saved: smartBinCode.co2Saved
      },
      message: `Success! You earned ${smartBinCode.pointsValue} points!`
    });
  } catch (error) {
    console.error('Redeem code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem code'
    });
  }
};

// @desc    Get user's redeemed codes history
// @route   GET /api/smartbin/my-codes
// @access  Private
const getMyCodes = async (req, res) => {
  try {
    const codes = await SmartBinCode.find({ 
      redeemedBy: req.user.id,
      status: 'redeemed'
    }).sort({ redeemedAt: -1 }).limit(50);
    
    res.json({
      success: true,
      data: codes
    });
  } catch (error) {
    console.error('Get codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get history'
    });
  }
};

// @desc    Get all codes (Admin)
// @route   GET /api/smartbin/admin/codes
// @access  Private/Admin
const getAllCodes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const codes = await SmartBinCode.find(query)
      .populate('redeemedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await SmartBinCode.countDocuments(query);
    
    res.json({
      success: true,
      data: codes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get codes'
    });
  }
};

// @desc    Get stats (Admin)
// @route   GET /api/smartbin/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalGenerated = await SmartBinCode.countDocuments();
    const totalRedeemed = await SmartBinCode.countDocuments({ status: 'redeemed' });
    const totalActive = await SmartBinCode.countDocuments({ status: 'active' });
    const totalExpired = await SmartBinCode.countDocuments({ status: 'expired' });
    
    const totalPointsGiven = await SmartBinCode.aggregate([
      { $match: { status: 'redeemed' } },
      { $group: { _id: null, total: { $sum: '$pointsValue' } } }
    ]);
    
    const totalWeightRecycled = await SmartBinCode.aggregate([
      { $match: { status: 'redeemed' } },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalGenerated,
        totalRedeemed,
        totalActive,
        totalExpired,
        totalPointsGiven: totalPointsGiven[0]?.total || 0,
        totalWeightRecycled: totalWeightRecycled[0]?.total || 0,
        redemptionRate: totalGenerated > 0 ? ((totalRedeemed / totalGenerated) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
};

module.exports = {
  generateCode,
  verifyCode,
  redeemCode,
  getMyCodes,
  getAllCodes,
  getStats
};