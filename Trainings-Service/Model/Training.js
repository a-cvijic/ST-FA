const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // Name is required
  },
  description: String,
  total_duration: {
    type: String,
    required: true // Duration is required
  },
  total_calories: {
    type: Number,
    min: 0 // Calories cannot be negative
  },
  exercise_ids: [{
    type: String,
    ref: 'Exercise' // Reference to another model (assuming Exercise model)
  }]
});

const Training = mongoose.model('Training', trainingSchema, 'trainings');

module.exports = Training;
