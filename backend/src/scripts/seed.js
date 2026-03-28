require('dotenv').config();
const mongoose = require('mongoose');
const Reward = require('../models/Reward');

const BETTER_REWARDS = [
  // ============ VOUCHERS & GIFT CARDS ============
  {
    name: 'Amazon Gift Card',
    points: 500,
    description: '₹50 Amazon e-Gift Card. Shop anything on Amazon.in',
    category: 'vouchers',
    stock: 'Unlimited',
    icon: '🛍️'
  },
  {
    name: 'Flipkart Gift Card',
    points: 1000,
    description: '₹100 Flipkart e-Gift Card. Electronics, fashion & more',
    category: 'vouchers',
    stock: 'Unlimited',
    icon: '📦'
  },
  {
    name: 'Swiggy Food Voucher',
    points: 750,
    description: '₹75 Swiggy cash. Order food from your favorite restaurants',
    category: 'vouchers',
    stock: 'Unlimited',
    icon: '🍔'
  },
  {
    name: 'Zomato Dining Voucher',
    points: 750,
    description: '₹75 Zomato cash. Dine out or order food delivery',
    category: 'vouchers',
    stock: 'Unlimited',
    icon: '🍕'
  },
  {
    name: 'Netflix Subscription',
    points: 3000,
    description: '1 Month Netflix Mobile Plan. Watch unlimited movies & shows',
    category: 'vouchers',
    stock: '50',
    icon: '🎬'
  },
  {
    name: 'Prime Video Subscription',
    points: 2500,
    description: '1 Month Amazon Prime Video. Watch exclusive content',
    category: 'vouchers',
    stock: '100',
    icon: '📺'
  },
  {
    name: 'BookMyShow Voucher',
    points: 800,
    description: '₹80 BookMyShow cash. Book movie tickets, events & more',
    category: 'vouchers',
    stock: 'Unlimited',
    icon: '🎫'
  },
  {
    name: 'Starbucks Coffee Voucher',
    points: 600,
    description: '₹60 Starbucks voucher. Enjoy your favorite coffee',
    category: 'vouchers',
    stock: 'Unlimited',
    icon: '☕'
  },
  {
    name: 'Dominos Pizza Voucher',
    points: 900,
    description: '₹90 Dominos voucher. Order your favorite pizza',
    category: 'vouchers',
    stock: 'Unlimited',
    icon: '🍕'
  },

  // ============ ECO PRODUCTS ============
  {
    name: 'Bamboo Toothbrush Set',
    points: 300,
    description: 'Set of 4 eco-friendly bamboo toothbrushes',
    category: 'eco-products',
    stock: '200',
    icon: '🪥'
  },
  {
    name: 'Reusable Metal Straws',
    points: 200,
    description: 'Set of 5 stainless steel straws with cleaning brush',
    category: 'eco-products',
    stock: '300',
    icon: '🥤'
  },
  {
    name: 'Organic Cotton Tote Bag',
    points: 400,
    description: 'Large organic cotton tote bag for grocery shopping',
    category: 'eco-products',
    stock: '150',
    icon: '🛒'
  },
  {
    name: 'Seed Paper Plant Kit',
    points: 250,
    description: 'Seed paper with basil/marigold seeds. Plant and watch it grow',
    category: 'eco-products',
    stock: '500',
    icon: '🌱'
  },
  {
    name: 'Reusable Water Bottle',
    points: 1200,
    description: 'Stainless steel insulated water bottle',
    category: 'eco-products',
    stock: '80',
    icon: '💧'
  },
  {
    name: 'Beeswax Food Wraps',
    points: 350,
    description: 'Set of 3 reusable beeswax wraps',
    category: 'eco-products',
    stock: '120',
    icon: '🍯'
  },
  {
    name: 'Compostable Phone Case',
    points: 800,
    description: '100% compostable phone case',
    category: 'eco-products',
    stock: '60',
    icon: '📱'
  },

  // ============ ECO ACTIONS (Charity) ============
  {
    name: 'Plant a Tree',
    points: 500,
    description: 'We plant one tree in your name',
    category: 'eco-actions',
    stock: 'Unlimited',
    icon: '🌳'
  },
  {
    name: 'Feed a Child',
    points: 300,
    description: 'Provide one nutritious meal to a child in need',
    category: 'eco-actions',
    stock: 'Unlimited',
    icon: '🍲'
  },
  {
    name: 'Clean Ocean Initiative',
    points: 1000,
    description: 'Support removal of 5kg plastic from oceans',
    category: 'eco-actions',
    stock: 'Unlimited',
    icon: '🌊'
  },
  {
    name: 'Adopt a Street Tree',
    points: 1500,
    description: 'Adopt and maintain a tree in your city',
    category: 'eco-actions',
    stock: 'Unlimited',
    icon: '🌲'
  },

  // ============ EDUCATION ============
  {
    name: 'E-Book: Zero Waste Living',
    points: 300,
    description: 'Complete guide to sustainable living',
    category: 'education',
    stock: 'Unlimited',
    icon: '📚'
  },
  {
    name: 'Gardening Masterclass',
    points: 800,
    description: 'Online course: Grow your own organic vegetables',
    category: 'education',
    stock: 'Unlimited',
    icon: '🌿'
  },
  {
    name: 'E-Book: Sustainable Fashion',
    points: 350,
    description: 'Guide to ethical and sustainable clothing',
    category: 'education',
    stock: 'Unlimited',
    icon: '👗'
  },
  {
    name: 'E-Book: Home Composting',
    points: 250,
    description: 'Step-by-step guide to composting at home',
    category: 'education',
    stock: 'Unlimited',
    icon: '🗑️'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing rewards
    const deleted = await Reward.deleteMany({});
    console.log(`✅ Cleared ${deleted.deletedCount} existing rewards`);

    // Insert better rewards
    const inserted = await Reward.insertMany(BETTER_REWARDS);
    console.log(`✅ Seeded ${inserted.length} better rewards`);

    console.log('\n📊 REWARD CATALOG UPDATED:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎫 Vouchers/Gift Cards: ${BETTER_REWARDS.filter(r => r.category === 'vouchers').length} rewards`);
    console.log(`🌱 Eco Products: ${BETTER_REWARDS.filter(r => r.category === 'eco-products').length} rewards`);
    console.log(`🌍 Eco Actions: ${BETTER_REWARDS.filter(r => r.category === 'eco-actions').length} rewards`);
    console.log(`📚 Education: ${BETTER_REWARDS.filter(r => r.category === 'education').length} rewards`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🎉 NEW REWARDS AVAILABLE:');
    console.log('   🛍️ Amazon, Flipkart, Swiggy, Zomato Gift Cards');
    console.log('   🎬 Netflix, Prime Video, BookMyShow Vouchers');
    console.log('   🪥 Bamboo Toothbrush, Metal Straws, Seed Kits');
    console.log('   🌳 Plant Trees, Feed Children, Clean Ocean');
    console.log('   📚 E-Books, Gardening Course, Composting Guide');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();