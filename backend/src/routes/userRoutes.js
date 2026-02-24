// src/routes/userRoutes.js
const express = require('express');
const { 
  updateProfile, 
  changePassword,
  getDashboardStats,
  getEnvironmentalImpact
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/impact', getEnvironmentalImpact);

module.exports = router;