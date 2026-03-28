const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');

const POINTS_PER_KG = {
  plastic: 10,
  paper: 8,
  metal: 25,
  ewaste: 100,
  glass: 5,
  batteries: 150,
  textiles: 7
};

// @desc    Create pickup request
// @route   POST /api/pickup/request
// @access  Private
const createPickupRequest = async (req, res) => {
  try {
    const { wasteTypes, address, preferredDate, preferredTimeSlot, specialInstructions } = req.body;

    // Validate input
    if (!wasteTypes || wasteTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please add at least one waste type'
      });
    }

    // Validate time slot
    const validTimeSlots = ['morning', 'afternoon', 'evening'];
    if (!validTimeSlots.includes(preferredTimeSlot)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time slot. Choose morning, afternoon, or evening'
      });
    }

    // Calculate totals
    let totalEstimatedWeight = 0;
    let totalEstimatedPoints = 0;

    for (const item of wasteTypes) {
      const weight = parseFloat(item.estimatedWeight) || 0;
      totalEstimatedWeight += weight;
      totalEstimatedPoints += weight * (POINTS_PER_KG[item.type] || 0);
    }

    totalEstimatedPoints = Math.round(totalEstimatedPoints);
    totalEstimatedWeight = Math.round(totalEstimatedWeight * 10) / 10;

    // Create pickup request with safe defaults for address
    const pickupRequest = await PickupRequest.create({
      userId: req.user.id,
      wasteTypes: wasteTypes.map(w => ({
        type: w.type,
        estimatedWeight: parseFloat(w.estimatedWeight)
      })),
      totalEstimatedWeight,
      totalEstimatedPoints,
      address: {
        street: address?.street || '',
        city: address?.city || '',
        pincode: address?.pincode || '',
        landmark: address?.landmark || ''
      },
      preferredDate: new Date(preferredDate),
      preferredTimeSlot,
      specialInstructions: specialInstructions || '',
      scheduledAt: new Date(preferredDate),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      pickupRequest,
      message: 'Pickup request submitted successfully!'
    });

  } catch (error) {
    console.error('Pickup request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create pickup request: ' + error.message
    });
  }
};

// @desc    Get user's pickup requests
// @route   GET /api/pickup/my-requests
// @access  Private
const getMyPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pickups: pickups || []
    });
  } catch (error) {
    console.error('Get pickups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pickup requests'
    });
  }
};

// @desc    Cancel pickup request
// @route   PUT /api/pickup/:id/cancel
// @access  Private
const cancelPickup = async (req, res) => {
  try {
    const { reason } = req.body;
    const pickup = await PickupRequest.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup request not found'
      });
    }

    if (pickup.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel pickup request at this stage'
      });
    }

    pickup.status = 'cancelled';
    pickup.cancellationReason = reason || 'Cancelled by user';
    await pickup.save();

    res.json({
      success: true,
      message: 'Pickup request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel pickup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel pickup request'
    });
  }
};

// @desc    Track pickup request
// @route   GET /api/pickup/track/:id
// @access  Private
const trackPickup = async (req, res) => {
  try {
    const pickup = await PickupRequest.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('assignedTo', 'fullName phone');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup request not found'
      });
    }

    res.json({
      success: true,
      pickup
    });
  } catch (error) {
    console.error('Track pickup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track pickup'
    });
  }
};

// ============ ADMIN FUNCTIONS ============

// @desc    Get all pickup requests (admin)
// @route   GET /api/admin/pickups
// @access  Private/Admin
const getAllPickups = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }
    
    const pickups = await PickupRequest.find(query)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await PickupRequest.countDocuments(query);
    
    res.json({
      success: true,
      pickups: pickups || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all pickups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pickup requests'
    });
  }
};

// @desc    Assign pickup to collector
// @route   PUT /api/admin/pickups/:id/assign
// @access  Private/Admin
const assignPickup = async (req, res) => {
  try {
    const { collectorId } = req.body;
    const pickup = await PickupRequest.findById(req.params.id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup request not found'
      });
    }
    
    if (pickup.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Pickup request cannot be assigned at this stage'
      });
    }
    
    pickup.assignedTo = collectorId;
    pickup.status = 'assigned';
    await pickup.save();
    
    res.json({
      success: true,
      message: 'Pickup assigned successfully',
      pickup
    });
  } catch (error) {
    console.error('Assign pickup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign pickup: ' + error.message
    });
  }
};

// @desc    Mark pickup as completed
// @route   PUT /api/admin/pickups/:id/complete
// @access  Private/Admin
const completePickup = async (req, res) => {
  try {
    const { actualWeight } = req.body;
    const pickup = await PickupRequest.findById(req.params.id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup request not found'
      });
    }
    
    if (pickup.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        error: 'Pickup cannot be completed at this stage'
      });
    }
    
    // Calculate actual points based on actual weight proportionally
    const ratio = actualWeight / pickup.totalEstimatedWeight;
    let totalPoints = 0;
    
    for (const waste of pickup.wasteTypes) {
      const pointsPerKg = POINTS_PER_KG[waste.type] || 0;
      totalPoints += (waste.estimatedWeight * ratio) * pointsPerKg;
    }
    
    totalPoints = Math.round(totalPoints);
    const totalActualWeight = Math.round(actualWeight * 10) / 10;
    
    // Update pickup
    pickup.actualWeight = totalActualWeight;
    pickup.pointsEarned = totalPoints;
    pickup.status = 'completed';
    pickup.completedAt = new Date();
    
    // Update user's points and stats
    const user = await User.findById(pickup.userId);
    if (user) {
      user.points = (user.points || 0) + totalPoints;
      user.totalRecycled = (user.totalRecycled || 0) + totalActualWeight;
      user.carbonSaved = (user.carbonSaved || 0) + (totalActualWeight * 0.5);
      user.treesSaved = Math.floor((user.carbonSaved || 0) / 20);
      await user.save();
    }
    
    await pickup.save();
    
    res.json({
      success: true,
      message: 'Pickup completed successfully',
      pickup,
      pointsAwarded: totalPoints,
      actualWeight: totalActualWeight
    });
  } catch (error) {
    console.error('Complete pickup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete pickup: ' + error.message
    });
  }
};

// @desc    Cancel pickup (admin)
// @route   PUT /api/admin/pickups/:id/cancel
// @access  Private/Admin
const cancelPickupAdmin = async (req, res) => {
  try {
    const { reason } = req.body;
    const pickup = await PickupRequest.findById(req.params.id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup request not found'
      });
    }
    
    pickup.status = 'cancelled';
    pickup.cancellationReason = reason || 'Cancelled by admin';
    await pickup.save();
    
    res.json({
      success: true,
      message: 'Pickup cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel pickup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel pickup'
    });
  }
};

// @desc    Get pickup statistics (admin)
// @route   GET /api/admin/pickups/stats
// @access  Private/Admin
const getPickupStats = async (req, res) => {
  try {
    const totalRequests = await PickupRequest.countDocuments();
    const pending = await PickupRequest.countDocuments({ status: 'pending' });
    const assigned = await PickupRequest.countDocuments({ status: 'assigned' });
    const completed = await PickupRequest.countDocuments({ status: 'completed' });
    const cancelled = await PickupRequest.countDocuments({ status: 'cancelled' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRequests = await PickupRequest.countDocuments({
      createdAt: { $gte: today }
    });
    
    const totalPointsAwarded = await PickupRequest.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pointsEarned' } } }
    ]);
    
    const totalWeightCollected = await PickupRequest.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$actualWeight' } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalRequests,
        pending,
        assigned,
        completed,
        cancelled,
        todayRequests,
        totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
        totalWeightCollected: (totalWeightCollected[0]?.total || 0).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get pickup stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pickup statistics'
    });
  }
};

module.exports = {
  createPickupRequest,
  getMyPickups,
  cancelPickup,
  trackPickup,
  getAllPickups,
  assignPickup,
  completePickup,
  cancelPickupAdmin,
  getPickupStats
};