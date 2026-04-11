// src/controllers/adminPickupController.js
const mongoose = require('mongoose');
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

const getAllPickups = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { trackingCode: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    const pickups = await PickupRequest.find(query)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await PickupRequest.countDocuments(query);
    
    res.json({
      success: true,
      pickups,
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

const getPickupDetails = async (req, res) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id)
      .populate('userId', 'fullName email phone address')
      .populate('assignedTo', 'fullName email phone');
    
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
    console.error('Get pickup details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pickup details'
    });
  }
};

const assignPickup = async (req, res) => {
  try {
    const { collectorId, estimatedArrivalTime, notes } = req.body;
    
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
    
    const collector = await User.findById(collectorId);
    if (!collector) {
      return res.status(404).json({
        success: false,
        error: 'Collector not found'
      });
    }
    
    pickup.assignedTo = collectorId;
    pickup.collectorName = collector.fullName;
    pickup.collectorPhone = collector.phone || 'Not available';
    pickup.estimatedArrivalTime = estimatedArrivalTime ? new Date(estimatedArrivalTime) : null;
    pickup.status = 'assigned';
    pickup.adminNotes = notes || '';
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

const markAsPickedUp = async (req, res) => {
  try {
    const { notes } = req.body;
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
        error: 'Pickup cannot be marked as picked up at this stage'
      });
    }
    
    pickup.status = 'picked_up';
    pickup.pickedUpAt = new Date();
    pickup.collectorNotes = notes || '';
    await pickup.save();
    
    res.json({
      success: true,
      message: 'Pickup marked as picked up',
      pickup
    });
  } catch (error) {
    console.error('Mark as picked up error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pickup status'
    });
  }
};

// ============ COMPLETE PICKUP - AUTOMATICALLY ADDS POINTS ============
const completePickup = async (req, res) => {
  try {
    const { actualWeight, notes } = req.body;
    
    console.log('========================================');
    console.log('COMPLETING PICKUP');
    console.log('========================================');
    console.log('Pickup ID:', req.params.id);
    console.log('Actual Weight:', actualWeight);
    
    // Validate input
    if (!actualWeight || actualWeight <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid actual weight'
      });
    }
    
    // Find the pickup
    const pickup = await PickupRequest.findById(req.params.id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup request not found'
      });
    }
    
    console.log('Tracking Code:', pickup.trackingCode);
    console.log('User ID:', pickup.userId);
    console.log('Estimated Weight:', pickup.totalEstimatedWeight);
    
    // Calculate points based on actual weight
    const weight = parseFloat(actualWeight);
    const ratio = weight / pickup.totalEstimatedWeight;
    let totalPoints = 0;
    
    for (const waste of pickup.wasteTypes) {
      const pointsPerKg = POINTS_PER_KG[waste.type] || 0;
      const actualWasteWeight = waste.estimatedWeight * ratio;
      totalPoints += actualWasteWeight * pointsPerKg;
    }
    
    totalPoints = Math.round(totalPoints);
    const totalActualWeight = Math.round(weight * 10) / 10;
    
    console.log('Calculated Points:', totalPoints);
    console.log('Calculated Actual Weight:', totalActualWeight);
    
    // Update pickup record
    pickup.actualWeight = totalActualWeight;
    pickup.pointsEarned = totalPoints;
    pickup.status = 'completed';
    pickup.completedAt = new Date();
    pickup.adminCompletionNotes = notes || '';
    await pickup.save();
    
    console.log('Pickup record saved');
    
    // ============ UPDATE USER POINTS ============
    // Convert userId to ObjectId if needed
    const userId = pickup.userId;
    console.log('Looking for user with ID:', userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('ERROR: User not found!');
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log('User found:', user.fullName);
    console.log('Email:', user.email);
    console.log('Current points:', user.points);
    console.log('Current totalRecycled:', user.totalRecycled);
    
    // Add points to user
    const oldPoints = user.points;
    user.points = (user.points || 0) + totalPoints;
    user.totalRecycled = (user.totalRecycled || 0) + totalActualWeight;
    user.carbonSaved = (user.carbonSaved || 0) + (totalActualWeight * 0.5);
    user.treesSaved = Math.floor((user.carbonSaved || 0) / 20);
    
    await user.save();
    
    console.log('========================================');
    console.log('✅ USER POINTS UPDATED!');
    console.log('   Old Points:', oldPoints);
    console.log('   Points Added:', totalPoints);
    console.log('   New Points:', user.points);
    console.log('   Total Recycled:', user.totalRecycled);
    console.log('========================================');
    
    // Return success response
    res.json({
      success: true,
      message: `Pickup completed! ${totalPoints} points awarded to ${user.fullName}`,
      pointsAwarded: totalPoints,
      actualWeight: totalActualWeight,
      userNewPoints: user.points,
      pickup: {
        id: pickup._id,
        trackingCode: pickup.trackingCode,
        actualWeight: pickup.actualWeight,
        pointsEarned: pickup.pointsEarned,
        status: pickup.status
      }
    });
    
  } catch (error) {
    console.error('Complete pickup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete pickup: ' + error.message
    });
  }
};
// ===============================================

const cancelPickup = async (req, res) => {
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

const approveReschedule = async (req, res) => {
  try {
    const { approved, adminNotes } = req.body;
    const pickup = await PickupRequest.findById(req.params.id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup request not found'
      });
    }
    
    if (approved) {
      pickup.status = 'pending';
      pickup.adminNotes = adminNotes || 'Reschedule approved';
    } else {
      const lastReschedule = pickup.rescheduleHistory[pickup.rescheduleHistory.length - 1];
      if (lastReschedule) {
        pickup.preferredDate = lastReschedule.oldDate;
        pickup.scheduledAt = lastReschedule.oldDate;
      }
      pickup.adminNotes = adminNotes || 'Reschedule rejected';
    }
    
    await pickup.save();
    
    res.json({
      success: true,
      message: approved ? 'Reschedule approved' : 'Reschedule rejected',
      pickup
    });
  } catch (error) {
    console.error('Approve reschedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process reschedule request'
    });
  }
};

const getPickupStats = async (req, res) => {
  try {
    const totalRequests = await PickupRequest.countDocuments();
    const pending = await PickupRequest.countDocuments({ status: 'pending' });
    const assigned = await PickupRequest.countDocuments({ status: 'assigned' });
    const pickedUp = await PickupRequest.countDocuments({ status: 'picked_up' });
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
    
    const avgRating = await PickupRequest.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalRequests,
        pending,
        assigned,
        pickedUp,
        completed,
        cancelled,
        todayRequests,
        totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
        totalWeightCollected: (totalWeightCollected[0]?.total || 0).toFixed(1),
        averageRating: avgRating[0]?.average?.toFixed(1) || 0
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

const getCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ 
      role: 'collector',
      isActive: true
    }).select('fullName email phone assignedZone');
    
    const formattedCollectors = collectors.map(collector => ({
      id: collector._id.toString(),
      _id: collector._id.toString(),
      fullName: collector.fullName,
      email: collector.email,
      phone: collector.phone || 'Not available',
      assignedZone: collector.assignedZone || 'Not assigned'
    }));
    
    res.json({
      success: true,
      collectors: formattedCollectors
    });
  } catch (error) {
    console.error('Get collectors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collectors'
    });
  }
};

const exportPickups = async (req, res) => {
  try {
    const { status = 'all', fromDate, toDate } = req.query;
    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }
    
    const pickups = await PickupRequest.find(query)
      .populate('userId', 'fullName email')
      .populate('assignedTo', 'fullName');
    
    const csvHeaders = ['Tracking Code', 'User', 'Email', 'Status', 'Waste Types', 'Estimated Weight', 'Actual Weight', 'Points Earned', 'Created At', 'Completed At'];
    const csvRows = pickups.map(p => [
      p.trackingCode,
      p.userId?.fullName || 'N/A',
      p.userId?.email || 'N/A',
      p.status,
      p.wasteTypes.map(w => `${w.type}(${w.estimatedWeight}kg)`).join(', '),
      p.totalEstimatedWeight,
      p.actualWeight || 'Pending',
      p.pointsEarned || 'Pending',
      new Date(p.createdAt).toLocaleDateString(),
      p.completedAt ? new Date(p.completedAt).toLocaleDateString() : '-'
    ]);
    
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=pickups_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export pickups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export pickups'
    });
  }
};

module.exports = {
  getAllPickups,
  getPickupDetails,
  assignPickup,
  markAsPickedUp,
  completePickup,
  cancelPickup,
  approveReschedule,
  getPickupStats,
  getCollectors,
  exportPickups
};