// direct-test.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const testDirectly = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🔧 DIRECT DATABASE TEST');
    console.log('='.repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find admin
    console.log('\n🔍 Looking for admin user...');
    const admin = await users.findOne({ email: 'admin@smartrecycle.com' });
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      process.exit(1);
    }

    console.log('✅ Admin found:');
    console.log('   ID:', admin._id);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Stored hash:', admin.password);

    // Test password
    const testPassword = 'Admin@123';
    console.log('\n🔐 Testing password:', testPassword);

    // Direct bcrypt comparison
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log('   bcrypt.compare result:', isValid);

    if (isValid) {
      console.log('\n✅ PASSWORD IS CORRECT!');
    } else {
      console.log('\n❌ PASSWORD IS INCORRECT!');
      
      // Generate new hash for debugging
      console.log('\n🔧 Generating new hash for "Admin@123"...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('   New hash:', newHash);
      console.log('   Does new hash match stored?', newHash === admin.password);
      
      // Test if password might have special characters
      console.log('\n📝 Testing password variations:');
      const variations = [
        'Admin@123',
        'admin@123',
        'ADMIN@123',
        'Admin123',
        'admin123'
      ];
      
      for (const variant of variations) {
        const result = await bcrypt.compare(variant, admin.password);
        console.log(`   "${variant}": ${result ? '✅ MATCH' : '❌ no match'}`);
      }
    }

    console.log('\n='.repeat(60));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testDirectly();