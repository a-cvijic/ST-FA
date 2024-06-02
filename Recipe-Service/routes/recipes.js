const express = require("express");
const Recipe = require("../models/Recipe");
const RecipeUser = require("../models/RecipeUser");
const jwt = require("jsonwebtoken");
const webpush = require("web-push");
require("dotenv").config();

const router = express.Router();
const secretKey = process.env.SECRET_KEY;
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("No token provided");
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.log("Token verification failed", err);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log("Authenticated user:", req.user);
    next();
  });
}

// Vapid keys for web push notifications
webpush.setVapidDetails("mailto:example@example.com", publicKey, privateKey);

// In-memory subscriptions storage
let subscriptions = [];

// Send a push notification
async function sendPushNotification(payload) {
  const notificationPayload = JSON.stringify(payload);

  try {
    subscriptions.forEach((subscription) => {
      webpush
        .sendNotification(subscription, notificationPayload)
        .catch((err) => {
          console.error("Failed to send push notification", err);
        });
    });
  } catch (err) {
    console.error("Failed to retrieve subscriptions", err);
  }
}

// Subscribe to push notifications
router.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscription added successfully" });
});

// CRUD operations for recipes
router.post("/recipes", authenticateToken, async (req, res) => {
  try {
    console.log("Create recipe request body:", req.body);
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json({ message: "Recipe created successfully", recipe });
    sendPushNotification({
      title: "New Recipe Added",
      body: "A new recipe has been added to your collection!",
    });
  } catch (err) {
    console.error("Failed to create recipe", err);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

router.get("/recipes", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching all recipes");
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    console.error("Failed to retrieve recipes", err);
    res.status(500).json({ error: "Failed to retrieve recipes" });
  }
});

router.get("/recipes/:id", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching recipe with ID:", req.params.id);
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (err) {
    console.error("Failed to retrieve recipe", err);
    res.status(500).json({ error: "Failed to retrieve recipe" });
  }
});

router.put("/recipes/:id", authenticateToken, async (req, res) => {
  try {
    console.log(
      "Updating recipe with ID:",
      req.params.id,
      "with body:",
      req.body
    );
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe updated successfully", recipe });
    sendPushNotification({
      title: "Recipe Updated",
      body: "A recipe has been updated in your collection!",
    });
  } catch (err) {
    console.error("Failed to update recipe", err);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

router.delete("/recipes/:id", authenticateToken, async (req, res) => {
  try {
    console.log("Deleting recipe with ID:", req.params.id);
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted successfully" });
    sendPushNotification({
      title: "Recipe Deleted",
      body: "A recipe has been deleted from your collection!",
    });
  } catch (err) {
    console.error("Failed to delete recipe", err);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Toggle favorite status of a recipe for a user
router.post("/recipes/favorite/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = req.params.id;

    const existingRecipe = await RecipeUser.findOne({ _id: recipeId, userId });
    if (existingRecipe) {
      await RecipeUser.findByIdAndDelete(existingRecipe._id);
      return res.status(200).send({ message: "Recipe removed from favorites" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const favoriteRecipe = new RecipeUser({ ...recipe.toObject(), userId });
    await favoriteRecipe.save();
    res
      .status(201)
      .json({ message: "Recipe added to favorites", favoriteRecipe });
  } catch (err) {
    console.error("Failed to toggle favorite recipe", err);
    res.status(500).json({ error: "Failed to toggle favorite recipe" });
  }
});

// Get user's favorite recipes
router.get("/recipes/favorites", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const favoriteRecipes = await RecipeUser.find({ userId });
    res.json(favoriteRecipes);
  } catch (err) {
    console.error("Failed to get favorite recipes", err);
    res.status(500).json({ error: "Failed to get favorite recipes" });
  }
});

module.exports = router;
