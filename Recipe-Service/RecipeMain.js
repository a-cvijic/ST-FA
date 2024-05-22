const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const webpush = require("web-push");
require("dotenv").config();

const recipeRoutes = require("./routes/recipes");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB initialization
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to database");
});

// Configure VAPID for Web Push Notifications
webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Use routes
app.use("/", recipeRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
