const mongoose = require('mongoose');
const exerciseSchema = new mongoose.Schema({
  name: String,
  description: String,
  duration: Number,
  calories: Number,
  type: String,
  difficulty: String
});
const Exercise = mongoose.model('Exercise', exerciseSchema, 'excercises');
module.exports = Exercise;
