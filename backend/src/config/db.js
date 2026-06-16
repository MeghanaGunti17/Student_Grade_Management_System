// backend/src/config/db.js
// STATUS: 🆕 NEW FILE — extracted from your server.js monolith
// Your original: mongoose.connect(process.env.MONGO_URI) was inline in server.js
// Now modular and reusable

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });


    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected — retrying...');
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };