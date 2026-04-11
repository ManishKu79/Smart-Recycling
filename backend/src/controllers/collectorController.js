// src/controllers/collectorController.js
const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');

const getAssignedPickups = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ 
      assignedTo: req.user.id,
      status: { $in: ['assigned', 'picked_up'] }
    })
    .populate('userId', 'fullName email phone address')
    .sort({ preferredDate: 1 });
    
    res.json({
      success: true,
      pickups: pickups || []
    });
  } catch (error) {
    console.error('Get assigned pickups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assigned pickups'
    });
  }
};

const getCollectorHistory = async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ 
      assignedTo: req.user.id,
      status: 'completed'
    })
    .populate('userId', 'fullName email phone address')
    .sort({ completedAt: -1 })
    .limit(100);
    
    let totalWeight = 0;
    let totalPointsAwarded = 0;
    let totalRatings = 0;
    let ratingSum = 0;
    
    for (const pickup of pickups) {
      const weight = pickup.actualWeight || 0;
      if (weight > 0) {
        totalWeight += weight;
      }
      
      const points = pickup.pointsEarned || 0;
      if (points > 0) {
        totalPointsAwarded += points;
      }
      
      const rating = pickup.rating || 0;
      if (rating > 0) {
        totalRatings++;
        ratingSum += rating;
      }
    }
    
    const stats = {
      totalPickups: pickups.length,
      totalWeight: parseFloat(totalWeight.toFixed(1)),
      totalPointsAwarded: totalPointsAwarded,
      averageRating: totalRatings > 0 ? parseFloat((ratingSum / totalRatings).toFixed(1)) : 0
    };
    
    res.json({
      success: true,
      pickups: pickups,
      stats: stats
    });
  } catch (error) {
    console.error('Get collector history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collector history: ' + error.message
    });
  }
};

const updatePickupStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const pickup = await PickupRequest.findOne({
      _id: req.params.id,
      assignedTo: req.user.id
    });
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup not found or not assigned to you'
      });
    }
    
    if (status === 'picked_up') {
      pickup.status = 'picked_up';
      pickup.pickedUpAt = new Date();
      pickup.collectorNotes = notes || '';
    } else if (status === 'completed') {
      pickup.status = 'completed';
      pickup.completedAt = new Date();
      pickup.collectorNotes = notes || '';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid status update'
      });
    }
    
    await pickup.save();
    
    res.json({
      success: true,
      message: `Pickup marked as ${status}`,
      pickup
    });
  } catch (error) {
    console.error('Update pickup status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pickup status: ' + error.message
    });
  }
};

const getCollectorDashboard = async (req, res) => {
  try {
    const assignedCount = await PickupRequest.countDocuments({ 
      assignedTo: req.user.id, 
      status: 'assigned' 
    });
    
    const pickedUpCount = await PickupRequest.countDocuments({ 
      assignedTo: req.user.id, 
      status: 'picked_up' 
    });
    
    const completedCount = await PickupRequest.countDocuments({ 
      assignedTo: req.user.id, 
      status: 'completed' 
    });
    
    const completedPickups = await PickupRequest.find({ 
      assignedTo: req.user.id, 
      status: 'completed' 
    });
    
    let totalWeightCollected = 0;
    for (const pickup of completedPickups) {
      if (pickup.actualWeight && pickup.actualWeight > 0) {
        totalWeightCollected += pickup.actualWeight;
      }
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPickups = await PickupRequest.countDocuments({
      assignedTo: req.user.id,
      preferredDate: { $gte: today, $lt: tomorrow }
    });
    
    res.json({
      success: true,
      stats: {
        assignedCount: assignedCount || 0,
        pickedUpCount: pickedUpCount || 0,
        completedCount: completedCount || 0,
        totalWeightCollected: parseFloat(totalWeightCollected.toFixed(1)) || 0,
        todayPickups: todayPickups || 0
      }
    });
  } catch (error) {
    console.error('Get collector dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard stats: ' + error.message
    });
  }
};

module.exports = {
  getAssignedPickups,
  getCollectorHistory,
  updatePickupStatus,
  getCollectorDashboard
};