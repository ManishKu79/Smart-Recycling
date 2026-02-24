// src/controllers/recycleController.js
const Submission = require('../models/Submission');
const User = require('../models/User');

// Points configuration
const POINTS_PER_KG = {
  plastic: parseInt(process.env.PLASTIC_POINTS) || 10,
  paper: parseInt(process.env.PAPER_POINTS) || 8,
  metal: parseInt(process.env.METAL_POINTS) || 25,
  ewaste: parseInt(process.env.EWASTE_POINTS) || 100,
  glass: parseInt(process.env.GLASS_POINTS) || 5,
  batteries: parseInt(process.env.BATTERIES_POINTS) || 150,
  textiles: parseInt(process.env.TEXTILES_POINTS) || 7
};

const CO2_PER_KG = {
  plastic: 0.5,
  paper: 0.3,
  metal: 1.2,
  ewaste: 2.5,
  glass: 0.2,
  batteries: 3.0,
  textiles: 0.4
};

// @desc    Detect waste from image (AI simulation)
// @route   POST /api/recycle/detect
// @access  Private
const detectWaste = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image provided' 
      });
    }

    // In production, this would call a Python AI service
    // For now, return simulated detection results
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Random detection for demo
    const wasteTypes = ['plastic', 'paper', 'metal', 'ewaste', 'glass', 'batteries', 'textiles'];
    const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const randomConfidence = 0.7 + Math.random() * 0.25;
    
    const detections = [
      {
        waste_type: randomType,
        confidence: randomConfidence,
        bounding_box: [100, 150, 300, 400],
        estimated_weight: 0.5 + Math.random() * 1.5
      }
    ];

    // Save image URL if needed
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    res.json({
      success: true,
      detections,
      imageUrl
    });
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Detection failed' 
    });
  }
};

// @desc    Submit recycling
// @route   POST /api/recycle/submit
// @access  Private
const submitRecycling = async (req, res) => {
  try {
    const { wasteType, weight, description, location, date } = req.body;

    // Calculate points and CO2 saved
    const pointsEarned = Math.round(weight * POINTS_PER_KG[wasteType]);
    const co2Saved = Math.round(weight * CO2_PER_KG[wasteType] * 10) / 10;

    // Create submission
    const submission = await Submission.create({
      userId: req.user.id,
      wasteType,
      weight,
      pointsEarned,
      co2Saved,
      description,
      location,
      date
    });

    res.status(201).json({
      success: true,
      submission,
      pointsEarned,
      co2Saved
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit recycling' 
    });
  }
};

// @desc    Get user recycling history
// @route   GET /api/recycle/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get history' 
    });
  }
};

// @desc    Get user recycling stats
// @route   GET /api/recycle/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      userId: req.user.id,
      status: 'approved'
    });

    let totalWeight = 0;
    let totalPoints = 0;
    let totalCO2 = 0;
    const byType = {};

    submissions.forEach(sub => {
      totalWeight += sub.weight;
      totalPoints += sub.pointsEarned;
      totalCO2 += sub.co2Saved;

      if (!byType[sub.wasteType]) {
        byType[sub.wasteType] = {
          count: 0,
          weight: 0,
          points: 0
        };
      }
      byType[sub.wasteType].count++;
      byType[sub.wasteType].weight += sub.weight;
      byType[sub.wasteType].points += sub.pointsEarned;
    });

    // Get recent activities
    const recentSubmissions = await Submission.find({ 
      userId: req.user.id 
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = recentSubmissions.map(sub => ({
      id: sub.id,
      wasteType: sub.wasteType,
      weight: sub.weight,
      points: sub.pointsEarned,
      date: sub.createdAt.toISOString().split('T')[0],
      status: sub.status
    }));

    res.json({
      success: true,
      stats: {
        totalWeight: Math.round(totalWeight * 10) / 10,
        totalPoints,
        totalCO2: Math.round(totalCO2 * 10) / 10,
        treesSaved: Math.floor(totalCO2 / 20),
        byType,
        recentActivities,
        count: submissions.length
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get stats' 
    });
  }
};

module.exports = {
  detectWaste,
  submitRecycling,
  getHistory,
  getStats
};