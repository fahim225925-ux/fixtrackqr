const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedIfEmpty = require('./utils/autoSeed');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FixTrack QR Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to FixTrack QR API. Visit /api/health to check status.',
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  if (mongoose.connection.readyState === 1) {
    await seedIfEmpty();
  }
  app.listen(PORT, () => {
    console.log(`🚀 FixTrack QR API Server listening on port ${PORT}`);
  });
};

startServer();
