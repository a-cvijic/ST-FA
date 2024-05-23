const express = require("express");
const { OpenAI } = require("openai");
const ChatMessage = require("../models/ChatMessages");
require("dotenv").config();

const router = express.Router();

// Initialize OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
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

module.exports = router;
