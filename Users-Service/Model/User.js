const mongoose = require('mongoose');

// Define schema for user collection
const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  birthdate: Date,
  gender: String,
  height: Number,
  weight: Number,
});

// Specify the database name ('users') explicitly
const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
