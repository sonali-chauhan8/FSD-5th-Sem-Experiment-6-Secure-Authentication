const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * Supports local MongoDB connection and MongoDB Atlas connection string.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_auth_db';
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
