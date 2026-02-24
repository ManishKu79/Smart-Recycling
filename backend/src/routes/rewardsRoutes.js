// src/routes/rewardsRoutes.js
const express = require('express');
const { 
  getCatalog, 
  getUserPoints, 
  redeemReward, 
  getRedemptionHistory 
} = require('../controllers/rewardsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/catalog', getCatalog);
router.get('/points', getUserPoints);
router.post('/redeem', redeemReward);
router.get('/history', getRedemptionHistory);

module.exports = router;