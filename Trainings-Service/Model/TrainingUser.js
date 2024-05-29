const mongoose = require('mongoose');

const trainingUserSchema = new mongoose.Schema({
  name: String,
  description: String,
  total_duration: String,
  total_calories: Number,
  exercise_ids: [String],
  userId: String
});

const TrainingUser = mongoose.models.TrainingUser || mongoose.model('TrainingUser', trainingUserSchema, 'trainingsuser');

module.exports = TrainingUser;