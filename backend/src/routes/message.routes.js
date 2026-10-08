const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

const {
  createMessage,
  getBookingMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  createDirectMessage,
  getConversationMessages,
  getDirectConversations,
} = require("../controllers/message.controller");

const router = express.Router();

router.get("/conversations", authenticate, getDirectConversations);

// Direct conversation. Customers may contact providers; providers may only
// contact customers who have an existing booking with them.
router.get("/conversation/:participantId", authenticate, getConversationMessages);
router.post(
  "/conversation/:participantId",
  authenticate,
  upload.array("images", 3),
  createDirectMessage
);

// create message
router.post(
  "/booking/:bookingId",
  authenticate,
  upload.array("images", 3),
  createMessage
);

// get all messages for booking
router.get(
  "/booking/:bookingId",
  authenticate,
  getBookingMessages
);

// get one message
router.get(
  "/:messageId",
  authenticate,
  getMessageById
);

// update message
router.patch(
  "/:messageId",
  authenticate,
  upload.array("images", 3),
  updateMessage
);

// delete message
router.delete(
  "/:messageId",
  authenticate,
  deleteMessage
);

// mark message as read
router.patch(
  "/:messageId/read",
  authenticate,
  markMessageAsRead
);

module.exports = router;
