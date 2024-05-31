const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: Number,
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


const User = mongoose.model('User', userSchema, 'users');

module.exports = User;