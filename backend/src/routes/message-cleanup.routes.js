const express = require("express");

const {
  cleanupMessages,
} = require("../controllers/message-cleanup.controller");

const router = express.Router();

router.post(
  "/messages",
  cleanupMessages
);

module.exports = router;