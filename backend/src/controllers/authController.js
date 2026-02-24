// src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Add this for direct testing

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

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Login user - DEBUG VERSION
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('🔍 LOGIN ATTEMPT');
    console.log('='.repeat(60));
    console.log('📧 Email:', email);
    console.log('🔑 Password received (length):', password.length);
    console.log('🔑 Password first character:', password[0]);
    console.log('='.repeat(60));

    // STEP 1: Find user with password field
    console.log('\n📡 Querying database for user...');
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ USER NOT FOUND in database');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    console.log('✅ USER FOUND:');
    console.log('   ID:', user._id);
    console.log('   Name:', user.fullName);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Hashed Password:', user.password);
    console.log('   Is Active:', user.isActive);

    // STEP 2: Check if account is active
    if (!user.isActive) {
      console.log('❌ ACCOUNT IS DEACTIVATED');
      return res.status(401).json({ 
        success: false, 
        error: 'Account is deactivated. Please contact admin.' 
      });
    }

    // STEP 3: Test password comparison directly with bcrypt
    console.log('\n🔐 TESTING PASSWORD COMPARISON:');
    console.log('   Input password:', password);
    console.log('   Stored hash:', user.password);
    
    // Method 1: Using model method
    console.log('\n📝 Method 1: Using user.comparePassword()');
    const isMatch = await user.comparePassword(password);
    console.log('   Result:', isMatch);

    // Method 2: Direct bcrypt comparison (for debugging)
    console.log('\n📝 Method 2: Direct bcrypt.compare()');
    const directMatch = await bcrypt.compare(password, user.password);
    console.log('   Result:', directMatch);

    if (!isMatch || !directMatch) {
      console.log('\n❌ PASSWORD MISMATCH!');
      
      // Generate a test hash for debugging
      const testHash = await bcrypt.hash('Admin@123', 10);
      console.log('\n🔧 DEBUG INFO:');
      console.log('   Test hash for "Admin@123":', testHash);
      console.log('   Does test hash match stored?', testHash === user.password);
      
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    console.log('\n✅ PASSWORD MATCH SUCCESSFUL!');

    // STEP 4: Update last active
    user.lastActive = new Date();
    await user.save();
    console.log('✅ Last active updated');

    // STEP 5: Generate token
    const token = generateToken(user.id);
    console.log('✅ Token generated');

    // STEP 6: Prepare response (remove password)
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('\n🎉 LOGIN SUCCESSFUL!');
    console.log('   User:', user.email);
    console.log('   Role:', user.role);
    console.log('='.repeat(60) + '\n');

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('\n❌ LOGIN ERROR:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      user: req.user 
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