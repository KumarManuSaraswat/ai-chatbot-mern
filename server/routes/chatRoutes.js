const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChats,
  getChatById,
} = require("../controllers/chatController");

router.post("/", sendMessage);
router.get("/", getChats);
router.get("/:id", getChatById);

module.exports = router;