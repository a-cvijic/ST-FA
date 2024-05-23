const express = require("express");
const Recipe = require("../models/Recipe");
const Subscription = require("../models/Subscription");
const webpush = require("web-push");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const secretKey = process.env.SECRET_KEY;

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Send a push notification
async function sendPushNotification() {
  const notificationPayload = JSON.stringify({
    title: "New Recipe Added",
    body: "A new recipe has been added to your collection!",
  });

  try {
    const subscriptions = await Subscription.find();
    subscriptions.forEach((subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      };
      webpush
        .sendNotification(pushSubscription, notificationPayload)
        .catch((err) => {
          console.error("Failed to send push notification", err);
        });
    });
  } catch (err) {
    console.error("Failed to retrieve subscriptions", err);
  }
}

// Subscribe to push notifications
router.post("/subscribe", async (req, res) => {
  try {
    const subscription = new Subscription(req.body.subscription);
    await subscription.save();
    res.status(201).json({ message: "Subscription added successfully" });
  } catch (err) {
    console.error("Failed to store subscription", err);
    res.status(500).json({ error: "Failed to store subscription" });
  }
});

// CRUD operations for recipes
// Create a new recipe
router.post("/recipes", authenticateToken, async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json({ message: "Recipe created successfully" });
    sendPushNotification(); // Send push notification after recipe is created
  } catch (err) {
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// Read all recipes
router.get("/recipes", authenticateToken, async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve recipes" });
  }
});

// Read a specific recipe by ID
router.get("/recipes/:id", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve recipe" });
  }
});

// Update a recipe by ID
router.put("/recipes/:id", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// Delete a recipe by ID
router.delete("/recipes/:id", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

module.exports = router;
