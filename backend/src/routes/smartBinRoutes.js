const express = require('express');
const {
  generateCode,
  verifyCode,
  redeemCode,
  getMyCodes,
  getAllCodes,
  getStats
} = require('../controllers/smartBinCodeController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public endpoint (for smart bin simulator)
router.post('/generate', generateCode);

// User endpoints (require login)
router.use(protect);
router.post('/verify', verifyCode);
router.post('/redeem', redeemCode);
router.get('/my-codes', getMyCodes);

// Admin endpoints
router.get('/admin/codes', admin, getAllCodes);
router.get('/admin/stacats', admin, getStats);

module.exports = router;