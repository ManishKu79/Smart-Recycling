// src/routes/recycleRoutes.js
const express = require('express');
const { 
  detectWaste, 
  submitRecycling, 
  getHistory, 
  getStats 
} = require('../controllers/recycleController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { submissionValidation } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.post('/detect', upload.single('image'), detectWaste);
router.post('/submit', submissionValidation, submitRecycling);
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;