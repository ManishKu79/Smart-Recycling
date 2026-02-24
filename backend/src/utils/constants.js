// src/utils/constants.js
const WASTE_TYPES = {
  plastic: { points: 10, icon: '♻️', name: 'Plastic' },
  paper: { points: 8, icon: '📄', name: 'Paper' },
  metal: { points: 25, icon: '⚙️', name: 'Metal' },
  ewaste: { points: 100, icon: '💻', name: 'E-waste' },
  glass: { points: 5, icon: '🍶', name: 'Glass' },
  batteries: { points: 150, icon: '🔋', name: 'Batteries' },
  textiles: { points: 7, icon: '👕', name: 'Textiles' }
};

const REWARD_CATEGORIES = {
  'eco-products': 'Eco Products',
  'vouchers': 'Vouchers',
  'eco-actions': 'Eco Actions',
  'education': 'Education'
};

const SUBMISSION_STATUS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

module.exports = {
  WASTE_TYPES,
  REWARD_CATEGORIES,
  SUBMISSION_STATUS
};