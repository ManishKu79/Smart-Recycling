// src/routes/adminRoutes.js
const express = require('express');

const {
  getAllPickups,
  assignPickup,
  completePickup,
  cancelPickupAdmin,
  getPickupStats
} = require('../controllers/pickupController');

const {
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
} = require('../controllers/adminController');

const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, admin);

// ================= SAFE WRAPPER =================
const safe = (fn) => (req, res, next) => {
  if (typeof fn !== 'function') {
    return res.status(500).json({
      success: false,
      error: 'Route handler undefined'
    });
  }
  return fn(req, res, next);
};

// ================= DASHBOARD =================
router.get('/stats', safe(getStats));

// ================= PICKUPS =================
router.get('/pickups', safe(getAllPickups));
router.get('/pickups/stats', safe(getPickupStats));
router.put('/pickups/:id/assign', safe(assignPickup));
router.put('/pickups/:id/complete', safe(completePickup));
router.put('/pickups/:id/cancel', safe(cancelPickupAdmin));

// ================= SUBMISSIONS =================
router.get('/submissions', safe(getSubmissions));
router.put('/submissions/:id/approve', safe(approveSubmission));
router.put('/submissions/:id/reject', safe(rejectSubmission));

// ================= USERS =================
router.get('/users', safe(getUsers));
router.put('/users/:id/role', safe(updateUserRole));
router.put('/users/:id/toggle-status', safe(toggleUserStatus));

// ================= REWARDS =================
router.post('/rewards', safe(createReward));
router.put('/rewards/:id', safe(updateReward));
router.delete('/rewards/:id', safe(deleteReward));

module.exports = router;