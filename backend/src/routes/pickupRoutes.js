// src/routes/pickupRoutes.js
const express = require('express');
const {
  createPickupRequest,
  getMyPickups,
  cancelPickup,
  trackPickup,
  reschedulePickup,
  ratePickup,
  getMyPickupStats
} = require('../controllers/pickupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/request', createPickupRequest);
router.get('/my-requests', getMyPickups);
router.get('/my-stats', getMyPickupStats);
router.get('/track/:id', trackPickup);
router.put('/:id/cancel', cancelPickup);
router.put('/:id/reschedule', reschedulePickup);
router.post('/:id/rate', ratePickup);

module.exports = router;