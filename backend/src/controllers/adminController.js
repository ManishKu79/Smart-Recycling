// src/controllers/adminController.js
const User = require('../models/User');
const Submission = require('../models/Submission');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
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

// @desc    Get all submissions
// @route   GET /api/admin/submissions
// @access  Private/Admin
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

// @desc    Approve submission
// @route   PUT /api/admin/submissions/:id/approve
// @access  Private/Admin
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

    // Update submission
    submission.status = 'approved';
    submission.approvedAt = new Date();
    submission.approvedBy = req.user.id;
    await submission.save();

    // Update user stats
    const user = await User.findById(submission.userId);
    if (user) {
      user.totalRecycled += submission.weight;
      user.carbonSaved += submission.co2Saved;
      user.treesSaved = Math.floor(user.carbonSaved / 20);
      user.points += submission.pointsEarned;
      
      // Update streak
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

// @desc    Reject submission
// @route   PUT /api/admin/submissions/:id/reject
// @access  Private/Admin
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

    // Update submission
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

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
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

    // Don't allow changing own role
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

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Don't allow deactivating own account
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

// @desc    Create reward
// @route   POST /api/admin/rewards
// @access  Private/Admin
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

// @desc    Update reward
// @route   PUT /api/admin/rewards/:id
// @access  Private/Admin
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

// @desc    Delete reward (soft delete)
// @route   DELETE /api/admin/rewards/:id
// @access  Private/Admin
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
  deleteReward
};