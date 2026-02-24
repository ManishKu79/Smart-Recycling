// src/middleware/validation.js
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('fullName')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('phone')
    .optional()
    .matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Submission validation
const submissionValidation = [
  body('wasteType')
    .isIn(['plastic', 'paper', 'metal', 'ewaste', 'glass', 'batteries', 'textiles'])
    .withMessage('Please select a valid waste type'),
  body('weight')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Weight must be between 0.1 and 1000 kg'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  submissionValidation
};