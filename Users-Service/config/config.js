const mongoose = require('mongoose');

const dbUri = 'mongodb://localhost:27017/st';

const connectDB = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log('Connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;