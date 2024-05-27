const mongoose = require('mongoose');

const exerciseUserSchema = new mongoose.Schema({
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
  repetitions: String,
  userId: String
});

const ExerciseUser = mongoose.models.ExerciseUser || mongoose.model('ExerciseUser', exerciseUserSchema, 'exercisesuser');

module.exports = ExerciseUser;