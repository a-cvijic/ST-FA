const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  calories: Number,
});

const Recipe = mongoose.model("Recipe", recipeSchema, "recipes");

module.exports = Recipe;
