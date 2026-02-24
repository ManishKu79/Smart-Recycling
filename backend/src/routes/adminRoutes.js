// src/routes/adminRoutes.js
const express = require('express');
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

// All admin routes require authentication and admin role
router.use(protect, admin);

// Dashboard
router.get('/stats', getStats);

// Submissions
router.get('/submissions', getSubmissions);
router.put('/submissions/:id/approve', approveSubmission);
router.put('/submissions/:id/reject', rejectSubmission);

// Users
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Rewards
router.post('/rewards', createReward);
router.put('/rewards/:id', updateReward);
router.delete('/rewards/:id', deleteReward);

module.exports = router;