const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const chatRoutes = require("./routes/chat");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI_CHAT;

if (!process.env.SECRET_KEY || !process.env.OPENAI_API_KEY || !MONGO_URI) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use("/chat", chatRoutes);

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
