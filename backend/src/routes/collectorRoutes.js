// src/routes/collectorRoutes.js
const express = require('express');
const {
  getAssignedPickups,
  getCollectorHistory,
  updatePickupStatus,
  getCollectorDashboard
} = require('../controllers/collectorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Check if user is collector or admin
router.use((req, res, next) => {
  if (req.user.role !== 'collector' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Collector access required'
    });
  }
  next();
});

// Collector routes
router.get('/dashboard', getCollectorDashboard);
router.get('/pickups', getAssignedPickups);
router.get('/history', getCollectorHistory);
router.put('/pickups/:id/status', updatePickupStatus);

module.exports = router;