const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  name: String,
  description: String,
  total_duration: String,
  total_calories: Number,
  exercise_ids: [Number]
});

const Training = mongoose.model('Training', trainingSchema, 'trainings');

module.exports = Training;
