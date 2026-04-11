// src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, address, city, pincode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      address,
      city,
      pincode,
      points: 100 // Welcome bonus
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Login user - FIXED VERSION
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    console.log('✅ User found:', user.email);

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account deactivated');
      return res.status(401).json({ 
        success: false, 
        error: 'Account is deactivated. Please contact admin.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    console.log('✅ Password correct');

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);
    console.log('✅ Token generated');

    // Prepare response (remove password)
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('🎉 Login successful for:', user.email);

    // ✅ ENSURE JSON RESPONSE - NO EXTRA TEXT
    return res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Login ERROR:', error);
    // ✅ ALWAYS return JSON, never plain text
    return res.status(500).json({ 
      success: false, 
      error: 'Server error during login. Please try again.' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // User is already attached by auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: user.toObject() 
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

module.exports = { register, login, getMe, logout };