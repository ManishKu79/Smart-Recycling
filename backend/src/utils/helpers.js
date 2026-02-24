// src/utils/helpers.js
const generateRandomCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const calculatePoints = (wasteType, weight) => {
  const pointsMap = {
    plastic: 10,
    paper: 8,
    metal: 25,
    ewaste: 100,
    glass: 5,
    batteries: 150,
    textiles: 7
  };
  
  return Math.round(weight * (pointsMap[wasteType] || 0));
};

const calculateCO2 = (wasteType, weight) => {
  const co2Map = {
    plastic: 0.5,
    paper: 0.3,
    metal: 1.2,
    ewaste: 2.5,
    glass: 0.2,
    batteries: 3.0,
    textiles: 0.4
  };
  
  return Math.round(weight * (co2Map[wasteType] || 0) * 10) / 10;
};

module.exports = {
  generateRandomCode,
  formatDate,
  calculatePoints,
  calculateCO2
};