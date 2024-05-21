const mongoose = require('mongoose');

const exerciseUserSchema = new mongoose.Schema({
  name: String,
  description: String,
  duration: Number,
  calories: Number,
  type: String,
  difficulty: String,
  userId: String
});

const ExerciseUser = mongoose.models.ExerciseUser || mongoose.model('ExerciseUser', exerciseUserSchema, 'exercisesuser');

module.exports = ExerciseUser;