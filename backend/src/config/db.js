const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixtrack_qr';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n------------------------------------------------------------');
    console.log('📌 Database Setup Instructions:');
    console.log('1. If running MongoDB locally: ensure the MongoDB Windows service is running (net start MongoDB)');
    console.log('2. If using MongoDB Atlas (cloud): update MONGODB_URI in backend/.env with your connection string:');
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fixtrack_qr');
    console.log('------------------------------------------------------------\n');
  }
};

module.exports = connectDB;
