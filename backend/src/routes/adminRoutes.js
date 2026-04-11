// src/routes/adminRoutes.js
const express = require('express');

const {
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
} = require('../controllers/adminPickupController');

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
  deleteReward,
  createCollector,
  getAllCollectors,
  updateCollector,
  deleteCollector
} = require('../controllers/adminController');

const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getStats);

router.get('/pickups', getAllPickups);
router.get('/pickups/stats', getPickupStats);
router.get('/pickups/export', exportPickups);
router.get('/pickups/:id', getPickupDetails);
router.put('/pickups/:id/assign', assignPickup);
router.put('/pickups/:id/pickup', markAsPickedUp);
router.put('/pickups/:id/complete', completePickup);
router.put('/pickups/:id/cancel', cancelPickup);
router.put('/pickups/:id/reschedule/approve', approveReschedule);

router.get('/collectors', getAllCollectors);
router.post('/collectors', createCollector);
router.put('/collectors/:id', updateCollector);
router.delete('/collectors/:id', deleteCollector);

router.get('/submissions', getSubmissions);
router.put('/submissions/:id/approve', approveSubmission);
router.put('/submissions/:id/reject', rejectSubmission);

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);

router.post('/rewards', createReward);
router.put('/rewards/:id', updateReward);
router.delete('/rewards/:id', deleteReward);

module.exports = router;