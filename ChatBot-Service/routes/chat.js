const express = require("express");
const { OpenAI } = require("openai");
const ChatMessage = require("../models/ChatMessages");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware function to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route to handle incoming chat messages
router.post("/", authenticateToken, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Send message to OpenAI for completion
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const chatbotMessage = response.choices[0].message.content;

    // Save user message and bot response to database
    const chatMessage = new ChatMessage({
      message: message,
      response: chatbotMessage,
    });
    await chatMessage.save();

    // Send bot response to client
    res.json({ response: chatbotMessage });
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    res.status(500).json({ error: "Error communicating with OpenAI" });
  }
});

// Route to get chat history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const chatHistory = await ChatMessage.find().sort({ createdAt: -1 });
    const formattedHistory = chatHistory.map((chat) => ({
      message: chat.message,
      response: chat.response,
      messages: [{ message: chat.message, response: chat.response }],
    }));
    res.json(formattedHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Error fetching chat history" });
  }
});

module.exports = router;
