// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create indexes
    await createIndexes();

    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  const db = mongoose.connection.db;
  
  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ points: -1 });
  
  // Submissions collection indexes
  await db.collection('submissions').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('submissions').createIndex({ status: 1 });
  
  // Rewards collection indexes
  await db.collection('rewards').createIndex({ points: 1 });
  await db.collection('rewards').createIndex({ category: 1 });
  
  console.log('✅ Database indexes created');
};

module.exports = connectDB;