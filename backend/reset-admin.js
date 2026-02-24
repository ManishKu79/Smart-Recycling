// reset-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🔧 RESET ADMIN PASSWORD');
    console.log('='.repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Look for existing admin
    console.log('\n🔍 Looking for existing admin...');
    const existingAdmin = await users.findOne({ email: 'admin@smartrecycle.com' });
    
    if (existingAdmin) {
      console.log('✅ Found existing admin. Updating password...');
      console.log('   Current hash:', existingAdmin.password);
      
      // Create new password hash
      const newPassword = 'Admin@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      console.log('📝 New password:', newPassword);
      console.log('🔐 New hash:', hashedPassword);
      
      // Update the admin
      await users.updateOne(
        { email: 'admin@smartrecycle.com' },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('✅ Password updated successfully');
      
      // Verify the new password
      const updatedAdmin = await users.findOne({ email: 'admin@smartrecycle.com' });
      const verifyCorrect = await bcrypt.compare('Admin@123', updatedAdmin.password);
      const verifyWrong = await bcrypt.compare('wrongpassword', updatedAdmin.password);
      
      console.log('\n🔐 Verification:');
      console.log('   Correct password ("Admin@123"):', verifyCorrect ? '✅ WORKS' : '❌ FAILS');
      console.log('   Wrong password ("wrongpassword"):', verifyWrong ? '❌ SHOULD FAIL' : '✅ CORRECTLY FAILS');
      
      if (verifyCorrect) {
        console.log('\n🎉 ADMIN PASSWORD RESET SUCCESSFUL!');
      } else {
        console.log('\n❌ PASSWORD VERIFICATION FAILED! Something went wrong.');
      }
    } else {
      console.log('❌ No existing admin found. Creating new admin...');
      
      // Create new admin
      const newPassword = 'Admin@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const newAdmin = {
        fullName: 'System Admin',
        email: 'admin@smartrecycle.com',
        password: hashedPassword,
        role: 'admin',
        points: 1000000,
        totalRecycled: 0,
        carbonSaved: 0,
        treesSaved: 0,
        streak: 0,
        isActive: true,
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      await users.insertOne(newAdmin);
      console.log('✅ New admin created');
      console.log('📝 Password:', newPassword);
      console.log('🔐 Hash:', hashedPassword);
      
      // Verify
      const verifyCorrect = await bcrypt.compare('Admin@123', hashedPassword);
      console.log('\n🔐 Password verification:', verifyCorrect ? '✅ WORKS' : '❌ FAILS');
    }

    // Show final admin details
    const finalAdmin = await users.findOne({ email: 'admin@smartrecycle.com' });
    console.log('\n📋 FINAL ADMIN DETAILS:');
    console.log('   ID:', finalAdmin._id);
    console.log('   Email:', finalAdmin.email);
    console.log('   Role:', finalAdmin.role);
    console.log('   Points:', finalAdmin.points);
    console.log('   Is Active:', finalAdmin.isActive);
    console.log('   Password Hash:', finalAdmin.password);
    
    // Test login with the new password
    console.log('\n🔑 TESTING LOGIN WITH NEW PASSWORD:');
    const testLogin = await bcrypt.compare('Admin@123', finalAdmin.password);
    console.log('   Result:', testLogin ? '✅ SUCCESS - You can now login!' : '❌ FAILED - Please try again');
    
    console.log('\n' + '='.repeat(60));
    console.log('🚀 NEXT STEPS:');
    console.log('1. Restart your backend server: npm run dev');
    console.log('2. Login with:');
    console.log('   Email: admin@smartrecycle.com');
    console.log('   Password: Admin@123');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
};

resetAdmin();