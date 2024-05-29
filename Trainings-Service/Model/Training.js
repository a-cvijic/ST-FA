const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  name: String,
  description: String,
  total_duration: String,
  total_calories: Number,
  exercise_ids: [String],
  favourite: Boolean,
  created: Date,
  updated: Date,
  user_id: String,
});

const Training = mongoose.models.Training || mongoose.model('Training', trainingSchema, 'trainings');

module.exports = Training;