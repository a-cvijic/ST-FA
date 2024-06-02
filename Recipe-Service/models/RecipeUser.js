const mongoose = require("mongoose");

const recipeUserSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  calories: Number,
  userId: String,
});

const RecipeUser = mongoose.model(
  "RecipeUser",
  recipeUserSchema,
  "recipesuser"
);

module.exports = RecipeUser;
