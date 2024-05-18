const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
const webpush = require("web-push");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database initialization
const db = new sqlite3.Database("recipes.db", (err) => {
  if (err) {
    console.error("Could not connect to the database", err);
  } else {
    console.log("Connected to the database");
  }
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    ingredients TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT,
    keys TEXT
  )`);
});

// Authentication configuration
const authConfig = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
};

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

// Configure VAPID for Web Push Notifications
webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Subscribe to push notifications
app.post("/subscribe", (req, res) => {
  const { endpoint, keys } = req.body.subscription;
  const query = `INSERT INTO subscriptions (endpoint, keys) VALUES (?, ?)`;
  db.run(query, [endpoint, JSON.stringify(keys)], function (err) {
    if (err) {
      console.error("Failed to insert subscription", err);
      res.status(500).json({ error: "Failed to store subscription" });
    } else {
      res.status(201).json({ message: "Subscription added successfully" });
    }
  });
});

// Send a push notification
function sendPushNotification() {
  const notificationPayload = JSON.stringify({
    title: "New Recipe Added",
    body: "A new recipe has been added to your collection!",
  });

  const query = `SELECT * FROM subscriptions`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Failed to retrieve subscriptions", err);
      return;
    }

    rows.forEach((subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: JSON.parse(subscription.keys),
      };
      webpush
        .sendNotification(pushSubscription, notificationPayload)
        .catch((err) => {
          console.error("Failed to send push notification", err);
        });
    });
  });
}

// CRUD operations for recipes
// Create a new recipe
app.post("/recipes", checkJwt, (req, res) => {
  const { name, ingredients } = req.body;
  db.run(
    `INSERT INTO recipes (name, ingredients) VALUES (?, ?)`,
    [name, JSON.stringify(ingredients)],
    function (err) {
      if (err) {
        res.status(500).json({ error: "Failed to create recipe" });
      } else {
        res.status(201).json({ message: "Recipe created successfully" });
        sendPushNotification(); // Send push notification after recipe is created
      }
    }
  );
});

// Read all recipes
app.get("/recipes", checkJwt, (req, res) => {
  db.all(`SELECT * FROM recipes`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Failed to retrieve recipes" });
    } else {
      res.json(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          ingredients: JSON.parse(row.ingredients),
        }))
      );
    }
  });
});

// Read a specific recipe by ID
app.get("/recipes/:id", checkJwt, (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM recipes WHERE id = ?`, id, (err, row) => {
    if (err) {
      res.status(500).json({ error: "Failed to retrieve recipe" });
    } else if (row) {
      res.json({
        id: row.id,
        name: row.name,
        ingredients: JSON.parse(row.ingredients),
      });
    } else {
      res.status(404).json({ error: "Recipe not found" });
    }
  });
});

// Update a recipe by ID
app.put("/recipes/:id", checkJwt, (req, res) => {
  const { name, ingredients } = req.body;
  db.run(
    `UPDATE recipes SET name = ?, ingredients = ? WHERE id = ?`,
    [name, JSON.stringify(ingredients), req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: "Failed to update recipe" });
      } else {
        res.json({ message: "Recipe updated successfully" });
      }
    }
  );
});

// Delete a recipe by ID
app.delete("/recipes/:id", checkJwt, (req, res) => {
  db.run(`DELETE FROM recipes WHERE id = ?`, req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: "Failed to delete recipe" });
    } else {
      res.json({ message: "Recipe deleted successfully" });
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
