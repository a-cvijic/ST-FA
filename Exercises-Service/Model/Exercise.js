const mongoose = require('mongoose');

// Define the schema for the exercise
const exerciseSchema = new mongoose.Schema({
  name: String,
  description: String,
  movement: String,
  benefits: [String],
  tips: [String],
  duration: Number,
  calories: Number,
  type: String,
  difficulty: String,
  series: Number,
  repetitions: String
});

// Define the Exercise model based on the schema
const Exercise = mongoose.model('Exercise', exerciseSchema, 'excercises');

module.exports = Exercise;

