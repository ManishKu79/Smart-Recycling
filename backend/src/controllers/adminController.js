// src/controllers/adminController.js
const User = require('../models/User');
const Submission = require('../models/Submission');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const PickupRequest = require('../models/PickupRequest');

// ============ EXISTING FUNCTIONS ============
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const approvedToday = await Submission.countDocuments({
      status: 'approved',
      approvedAt: { $gte: today }
    });
    
    const pointsResult = await Submission.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$pointsEarned' } } }
    ]);
    const totalPoints = pointsResult[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSubmissions,
        pendingSubmissions,
        approvedToday,
        totalPoints
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get admin stats' 
    });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get submissions' 
    });
  }
};

const approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Submission not found' 
      });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Submission already processed' 
      });
    }

    submission.status = 'approved';
    submission.approvedAt = new Date();
    submission.approvedBy = req.user.id;
    await submission.save();

    const user = await User.findById(submission.userId);
    if (user) {
      user.totalRecycled += submission.weight;
      user.carbonSaved += submission.co2Saved;
      user.treesSaved = Math.floor(user.carbonSaved / 20);
      user.points += submission.pointsEarned;
      
      const lastSubmission = await Submission.findOne({
        userId: user.id,
        status: 'approved',
        createdAt: { $lt: submission.createdAt }
      }).sort({ createdAt: -1 });

      if (lastSubmission) {
        const daysDiff = Math.floor((submission.createdAt - lastSubmission.createdAt) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          user.streak += 1;
        } else if (daysDiff > 1) {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }

      await user.save();
    }

    res.json({
      success: true,
      message: 'Submission approved successfully'
    });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to approve submission' 
    });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const { reason } = req.body;

    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Submission not found' 
      });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Submission already processed' 
      });
    }

    submission.status = 'rejected';
    submission.rejectionReason = reason;
    submission.approvedAt = new Date();
    submission.approvedBy = req.user.id;
    await submission.save();

    res.json({
      success: true,
      message: 'Submission rejected'
    });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject submission' 
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get users' 
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot change your own role' 
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user role' 
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot deactivate your own account' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle user status' 
    });
  }
};

const createReward = async (req, res) => {
  try {
    const reward = await Reward.create(req.body);

    res.status(201).json({
      success: true,
      reward
    });
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create reward' 
    });
  }
};

const updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!reward) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reward not found' 
      });
    }

    res.json({
      success: true,
      reward
    });
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update reward' 
    });
  }
};

const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!reward) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reward not found' 
      });
    }

    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete reward' 
    });
  }
};

// ============ COLLECTOR MANAGEMENT FUNCTIONS (FIXED) ============

const createCollector = async (req, res) => {
  try {
    const { fullName, email, password, phone, address, city, pincode, assignedZone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    const collector = await User.create({
      fullName,
      email,
      password,
      phone,
      address,
      city,
      pincode,
      role: 'collector',
      assignedZone: assignedZone || '',
      points: 0,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Collector created successfully',
      collector: {
        id: collector._id,
        fullName: collector.fullName,
        email: collector.email,
        phone: collector.phone
      }
    });
  } catch (error) {
    console.error('Create collector error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create collector'
    });
  }
};

const getAllCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ role: 'collector' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    const collectorsWithStats = await Promise.all(collectors.map(async (collector) => {
      const completedPickups = await PickupRequest.countDocuments({
        assignedTo: collector._id,
        status: 'completed'
      });
      
      const avgRating = await PickupRequest.aggregate([
        { $match: { assignedTo: collector._id, rating: { $ne: null } } },
        { $group: { _id: null, average: { $avg: '$rating' } } }
      ]);
      
      // Return clean object with explicit id field
      return {
        id: collector._id.toString(),
        _id: collector._id.toString(),
        fullName: collector.fullName,
        email: collector.email,
        phone: collector.phone || '',
        address: collector.address || '',
        city: collector.city || '',
        pincode: collector.pincode || '',
        assignedZone: collector.assignedZone || '',
        isActive: collector.isActive,
        role: collector.role,
        completedPickups: completedPickups || 0,
        averageRating: avgRating[0]?.average?.toFixed(1) || 0,
        createdAt: collector.createdAt
      };
    }));
    
    res.json({
      success: true,
      collectors: collectorsWithStats
    });
  } catch (error) {
    console.error('Get all collectors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collectors: ' + error.message
    });
  }
};

const updateCollector = async (req, res) => {
  try {
    const { fullName, phone, address, city, pincode, assignedZone, isActive } = req.body;
    
    const collector = await User.findById(req.params.id);
    if (!collector || collector.role !== 'collector') {
      return res.status(404).json({
        success: false,
        error: 'Collector not found'
      });
    }
    
    if (fullName) collector.fullName = fullName;
    if (phone) collector.phone = phone;
    if (address) collector.address = address;
    if (city) collector.city = city;
    if (pincode) collector.pincode = pincode;
    if (assignedZone) collector.assignedZone = assignedZone;
    if (typeof isActive === 'boolean') collector.isActive = isActive;
    
    await collector.save();
    
    res.json({
      success: true,
      message: 'Collector updated successfully',
      collector: {
        id: collector._id,
        fullName: collector.fullName,
        email: collector.email,
        phone: collector.phone,
        isActive: collector.isActive
      }
    });
  } catch (error) {
    console.error('Update collector error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update collector'
    });
  }
};

const deleteCollector = async (req, res) => {
  try {
    const collector = await User.findById(req.params.id);
    if (!collector || collector.role !== 'collector') {
      return res.status(404).json({
        success: false,
        error: 'Collector not found'
      });
    }
    
    const assignedPickups = await PickupRequest.countDocuments({
      assignedTo: collector._id,
      status: { $in: ['assigned', 'picked_up'] }
    });
    
    if (assignedPickups > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete collector with ${assignedPickups} active pickups`
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Collector deleted successfully'
    });
  } catch (error) {
    console.error('Delete collector error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete collector'
    });
  }
};

module.exports = {
  getStats,
  getSubmissions,
  approveSubmission,
  rejectSubmission,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  createReward,
  updateReward,
  deleteReward,
  createCollector,
  getAllCollectors,
  updateCollector,
  deleteCollector
};