const mongoose = require('mongoose');
const store = require('../utils/dataStore');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixtrack_qr';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    global.useFallbackDb = false;
  } catch (error) {
    global.useFallbackDb = true;
    await store.init();
    console.log('⚡ Running with FixTrack Zero-Config Datastore (Embedded Mode)');
    console.log('   All features, demo accounts, and QR endpoints are 100% active!');
    console.log(`   (Note: To connect persistent MongoDB, set MONGODB_URI in backend/.env)`);
  }
};

module.exports = connectDB;
