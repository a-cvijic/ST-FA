const mongoose = require('mongoose');

// Define schema for user collection
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

// Specify the database name ('users') explicitly
const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
