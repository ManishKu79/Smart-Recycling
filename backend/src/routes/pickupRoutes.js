const express = require('express');
const {
  createPickupRequest,
  getMyPickups,
  cancelPickup,
  trackPickup
} = require('../controllers/pickupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/request', createPickupRequest);
router.get('/my-requests', getMyPickups);
router.get('/track/:id', trackPickup);
router.put('/:id/cancel', cancelPickup);

module.exports = router;