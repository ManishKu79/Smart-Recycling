// src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city, pincode } = req.body;

    const user = await User.findById(req.user.id);
    
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (pincode) user.pincode = pincode;

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Change password
// @route   POST /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/user/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      stats: {
        totalWeight: user.totalRecycled || 0,
        totalPoints: user.points,
        carbonSaved: user.carbonSaved || 0,
        treesSaved: user.treesSaved || 0,
        streak: user.streak || 0
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Get environmental impact
// @route   GET /api/user/dashboard/impact
// @access  Private
const getEnvironmentalImpact = async (req, res) => {
  try {
    const user = req.user;
    const totalWeight = user.totalRecycled || 0;
    
    // Calculate environmental impact
    const waterSaved = totalWeight * 50; // 50L per kg
    const energySaved = totalWeight * 3; // 3 kWh per kg

    res.json({
      success: true,
      impact: {
        treesSaved: user.treesSaved || 0,
        waterSaved: Math.round(waterSaved),
        energySaved: Math.round(energySaved),
        co2Reduced: Math.round(user.carbonSaved * 10) / 10,
        landfillDiverted: Math.round(totalWeight * 10) / 10
      }
    });
  } catch (error) {
    console.error('Impact error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  getDashboardStats,
  getEnvironmentalImpact
};