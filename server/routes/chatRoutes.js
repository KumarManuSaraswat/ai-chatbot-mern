const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChats,
  getChatById,
  deleteChat,
  renameChat,
} = require("../controllers/chatController");

router.post("/", sendMessage);
router.get("/", getChats);
router.get("/:id", getChatById);
router.delete("/:id", deleteChat);
router.patch("/:id", renameChat);

module.exports = router;