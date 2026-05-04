const { GoogleGenAI } = require("@google/genai");
const Chat = require("../models/Chat");

const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    let chat = null;

    if (chatId) {
      chat = await Chat.findById(chatId);
    }

    if (!chat) {
      chat = new Chat({
        title: message.slice(0, 30),
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: message,
    });

    const historyForGemini = chat.messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: historyForGemini,
    });

    const botReply = response.text || "No response generated.";

    chat.messages.push({
      role: "assistant",
      content: botReply,
    });

    await chat.save();

    res.status(200).json({
      success: true,
      chatId: chat._id,
      reply: botReply,
      messages: chat.messages,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({
      error: "Server error while generating AI response",
      details: error.message,
    });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getChats,
  getChatById,
};