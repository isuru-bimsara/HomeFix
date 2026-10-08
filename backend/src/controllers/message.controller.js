const {
  Message,
  MessageImage,
  Booking,
  User,
  CustomerProfile,
  ServiceProviderProfile,
} = require("../models");

const {
  uploadImageToCloudinary,
  deleteCloudinaryImage,
} = require("../utils/cloudinary-upload");

const sequelize = require("../config/database");
const { Op } = require("sequelize");
const { notifyUser } = require("../services/notification.service");

const MAX_IMAGES =
  Number(process.env.MESSAGE_MAX_IMAGES) || 3;

const EDIT_MINUTES =
  Number(process.env.MESSAGE_EDIT_MINUTES) || 5;

const RETENTION_HOURS =
  Number(process.env.MESSAGE_RETENTION_HOURS) || 24;

const MAX_MESSAGE_LENGTH = 2000;

function isValidUUID(value) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
}

async function safeRollback(transaction) {
  try {
    if (
      transaction &&
      !transaction.finished
    ) {
      await transaction.rollback();
    }
  } catch (error) {
    console.error(
      "Message rollback error:",
      error.message
    );
  }
}

function getMessageText(body) {
  if (
    body.messageText === undefined ||
    body.messageText === null
  ) {
    return null;
  }

  return String(body.messageText).trim();
}

function canAccessBooking(booking, user) {
  if (!booking) {
    return false;
  }

  return (
    (user.role === "CUSTOMER" &&
      booking.customerId === user.id) ||
    (user.role === "SERVICE_PROVIDER" &&
      booking.serviceProviderId === user.id)
  );
}

function getReceiverId(booking, user) {
  if (user.role === "CUSTOMER") {
    return booking.serviceProviderId;
  }

  if (user.role === "SERVICE_PROVIDER") {
    return booking.customerId;
  }

  return null;
}

function formatMessage(message) {
  const data = message.toJSON();

  let senderName = null;

  if (data.sender) {
    if (data.sender.customerProfile) {
      senderName =
        `${data.sender.customerProfile.firstName} ${data.sender.customerProfile.lastName}`.trim();
    }

    if (data.sender.serviceProviderProfile) {
      senderName =
        `${data.sender.serviceProviderProfile.firstName} ${data.sender.serviceProviderProfile.lastName}`.trim();
    }
  }

  return {
    id: data.id,

    bookingId: data.bookingId,

    senderId: data.senderId,

    receiverId: data.receiverId,

    senderRole: data.sender?.role || null,

    senderName,

    senderProfileImageUrl:
      data.sender?.profileImageUrl || null,

    messageText: data.messageText,

    images: data.images || [],

    isEdited: data.isEdited,

    readAt: data.readAt,

    isRead: Boolean(data.readAt),

    createdAt: data.createdAt,

    updatedAt: data.updatedAt,

    expiresAt: data.expiresAt,
  };
}

const messageInclude = [
  {
    model: User,
    as: "sender",
    attributes: [
      "id",
      "role",
      "profileImageUrl",
    ],
    include: [
      {
        model: CustomerProfile,
        as: "customerProfile",
        attributes: [
          "firstName",
          "lastName",
        ],
        required: false,
      },
      {
        model: ServiceProviderProfile,
        as: "serviceProviderProfile",
        attributes: [
          "firstName",
          "lastName",
        ],
        required: false,
      },
    ],
  },

  {
    model: MessageImage,
    as: "images",
    attributes: [
      "id",
      "imageUrl",
      "publicId",
      "createdAt",
    ],
  },
];

async function getConversationParticipant(userId) {
  return User.findByPk(userId, {
    attributes: ["id", "role", "profileImageUrl", "isActive"],
    include: [
      { model: CustomerProfile, as: "customerProfile", required: false },
      { model: ServiceProviderProfile, as: "serviceProviderProfile", required: false },
    ],
  });
}

function formatParticipant(user) {
  const profile = user.customerProfile || user.serviceProviderProfile;
  return {
    id: user.id,
    role: user.role,
    name: profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "HomeFix user",
    profileImageUrl: user.profileImageUrl || null,
  };
}

async function canOpenDirectConversation(user, participant) {
  if (!participant || !participant.isActive) return false;
  if (user.role === "CUSTOMER") {
    return participant.role === "SERVICE_PROVIDER";
  }
  if (user.role === "SERVICE_PROVIDER" && participant.role === "CUSTOMER") {
    return Boolean(await Booking.findOne({
      where: { serviceProviderId: user.id, customerId: participant.id },
      attributes: ["id"],
    }));
  }
  return false;
}

async function authorizeConversation(req, res) {
  const { participantId } = req.params;
  if (!isValidUUID(participantId) || participantId === req.user.id) {
    res.status(400).json({ success: false, message: "Invalid conversation participant." });
    return null;
  }
  const participant = await getConversationParticipant(participantId);
  if (!participant) {
    res.status(404).json({ success: false, message: "Conversation participant not found." });
    return null;
  }
  if (!(await canOpenDirectConversation(req.user, participant))) {
    res.status(403).json({
      success: false,
      message: req.user.role === "SERVICE_PROVIDER"
        ? "You can only message customers who have booked your service."
        : "You are not allowed to start this conversation.",
    });
    return null;
  }
  return participant;
}

const getConversationMessages = async (req, res, next) => {
  try {
    const participant = await authorizeConversation(req, res);
    if (!participant) return;
    const messages = await Message.findAll({
      where: {
        bookingId: null,
        [Op.or]: [
          { senderId: req.user.id, receiverId: participant.id },
          { senderId: participant.id, receiverId: req.user.id },
        ],
      },
      include: messageInclude,
      order: [["createdAt", "ASC"]],
    });
    return res.json({
      success: true,
      participant: formatParticipant(participant),
      messages: messages.map(formatMessage),
    });
  } catch (error) {
    next(error);
  }
};

const getDirectConversations = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: {
        bookingId: null,
        [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      include: messageInclude,
      order: [["createdAt", "DESC"]],
    });
    const latestByUser = new Map();
    for (const message of messages) {
      const otherId = message.senderId === req.user.id ? message.receiverId : message.senderId;
      if (!latestByUser.has(otherId)) latestByUser.set(otherId, message);
    }
    const users = await User.findAll({
      where: { id: { [Op.in]: [...latestByUser.keys()] } },
      attributes: ["id", "role", "profileImageUrl", "isActive"],
      include: [
        { model: CustomerProfile, as: "customerProfile", required: false },
        { model: ServiceProviderProfile, as: "serviceProviderProfile", required: false },
      ],
    });
    const userMap = new Map(users.map((user) => [user.id, user]));
    const conversations = [...latestByUser.entries()].flatMap(([participantId, message]) => {
      const participant = userMap.get(participantId);
      return participant ? [{ participant: formatParticipant(participant), lastMessage: formatMessage(message) }] : [];
    });
    return res.json({ success: true, conversations });
  } catch (error) { next(error); }
};

const createDirectMessage = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  const uploadedImages = [];
  try {
    const participant = await authorizeConversation(req, res);
    if (!participant) {
      await safeRollback(transaction);
      return;
    }
    const messageText = getMessageText(req.body);
    const files = req.files || [];
    if (!messageText && files.length === 0) {
      await safeRollback(transaction);
      return res.status(400).json({ success: false, message: "Message text or at least one image is required." });
    }
    if (messageText && messageText.length > MAX_MESSAGE_LENGTH) {
      await safeRollback(transaction);
      return res.status(400).json({ success: false, message: "Message cannot exceed 2000 characters." });
    }
    if (files.length > MAX_IMAGES) {
      await safeRollback(transaction);
      return res.status(400).json({ success: false, message: "Maximum 3 images are allowed per message." });
    }
    const message = await Message.create({
      bookingId: null,
      senderId: req.user.id,
      receiverId: participant.id,
      messageText: messageText || null,
      expiresAt: new Date(Date.now() + RETENTION_HOURS * 60 * 60 * 1000),
    }, { transaction });
    for (const file of files) {
      const result = await uploadImageToCloudinary(file, `home-service/messages/${message.id}`);
      uploadedImages.push(result.public_id);
      await MessageImage.create({
        messageId: message.id,
        imageUrl: result.secure_url,
        publicId: result.public_id,
      }, { transaction });
    }
    await transaction.commit();
    const createdMessage = await Message.findByPk(message.id, { include: messageInclude });
    await notifyUser(participant.id, { type: "MESSAGE", title: "New message", body: messageText || "You received a photo message.", entityType: "MESSAGE", entityId: message.id, data: { participantId: req.user.id } });
    return res.status(201).json({ success: true, message: "Message sent successfully.", data: formatMessage(createdMessage) });
  } catch (error) {
    await safeRollback(transaction);
    for (const publicId of uploadedImages) await deleteCloudinaryImage(publicId);
    next(error);
  }
};

// create message
const createMessage = async (
  req,
  res,
  next
) => {
  const transaction =
    await sequelize.transaction();

  const uploadedImages = [];

  try {
    const { bookingId } = req.params;

    if (!isValidUUID(bookingId)) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (
      !["CUSTOMER", "SERVICE_PROVIDER"].includes(
        req.user.role
      )
    ) {
      await safeRollback(transaction);

      return res.status(403).json({
        success: false,
        message:
          "Only customers and service providers can send messages.",
      });
    }

    const booking = await Booking.findByPk(
      bookingId,
      {
        transaction,
      }
    );

    if (!booking) {
      await safeRollback(transaction);

      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!canAccessBooking(booking, req.user)) {
      await safeRollback(transaction);

      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access this booking chat.",
      });
    }

    if (booking.status === "REJECTED") {
      await safeRollback(transaction);

      return res.status(409).json({
        success: false,
        message:
          "Messages cannot be sent for a rejected booking.",
      });
    }

    const messageText =
      getMessageText(req.body);

    const files = req.files || [];

    if (files.length > MAX_IMAGES) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message:
          "Maximum 3 images are allowed per message.",
      });
    }

    if (
      !messageText &&
      files.length === 0
    ) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message:
          "Message text or at least one image is required.",
      });
    }

    if (
      messageText &&
      messageText.length > MAX_MESSAGE_LENGTH
    ) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 2000 characters.",
      });
    }

    const receiverId =
      getReceiverId(booking, req.user);

    if (!receiverId) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message:
          "Unable to determine message receiver.",
      });
    }

    const expiresAt = new Date(
      Date.now() +
        RETENTION_HOURS *
          60 *
          60 *
          1000
    );

    const message = await Message.create(
      {
        bookingId: booking.id,
        senderId: req.user.id,
        receiverId,
        messageText: messageText || null,
        expiresAt,
      },
      {
        transaction,
      }
    );

    for (const file of files) {
      const result =
        await uploadImageToCloudinary(
          file,
          `home-service/messages/${message.id}`
        );

      uploadedImages.push(
        result.public_id
      );

      await MessageImage.create(
        {
          messageId: message.id,
          imageUrl: result.secure_url,
          publicId: result.public_id,
        },
        {
          transaction,
        }
      );
    }

    await transaction.commit();

    const createdMessage =
      await Message.findByPk(
        message.id,
        {
          include: messageInclude,
        }
      );

    await notifyUser(receiverId, { type: "BOOKING_MESSAGE", title: "New booking message", body: messageText || "You received a photo message.", entityType: "BOOKING", entityId: booking.id, data: { bookingId: booking.id } });

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully.",
      data: formatMessage(
        createdMessage
      ),
    });
  } catch (error) {
    await safeRollback(transaction);

    for (const publicId of uploadedImages) {
      await deleteCloudinaryImage(
        publicId
      );
    }

    next(error);
  }
};

// get all messages for booking
const getBookingMessages = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!isValidUUID(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (
      !["CUSTOMER", "SERVICE_PROVIDER"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only customers and service providers can access chat.",
      });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access this booking chat.",
      });
    }

    const messages = await Message.findAll({
      where: {
        bookingId,
      },

      include: messageInclude,

      order: [["created_at", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: messages.length,
      bookingId,
      messages: messages.map(formatMessage),
    });
  } catch (error) {
    console.error(
      "Get booking messages error:",
      error
    );

    next(error);
  }
};

// get one message
const getMessageById = async (
  req,
  res,
  next
) => {
  try {
    const { messageId } =
      req.params;

    if (!isValidUUID(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message =
      await Message.findByPk(
        messageId,
        {
          include: [
            ...messageInclude,
            {
              model: Booking,
              as: "booking",
            },
          ],
        }
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (
      message.senderId !== req.user.id &&
      message.receiverId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this message.",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatMessage(
        message
      ),
    });
  } catch (error) {
    next(error);
  }
};

// update message
const updateMessage = async (
  req,
  res,
  next
) => {
  const transaction =
    await sequelize.transaction();

  const uploadedImages = [];
  const oldCloudinaryImages = [];

  try {
    const { messageId } =
      req.params;

    if (!isValidUUID(messageId)) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message =
      await Message.findByPk(
        messageId,
        {
          include: [
            {
              model: MessageImage,
              as: "images",
            },
          ],
          transaction,
        }
      );

    if (!message) {
      await safeRollback(transaction);

      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (message.senderId !== req.user.id) {
      await safeRollback(transaction);

      return res.status(403).json({
        success: false,
        message:
          "You can only edit your own messages.",
      });
    }

    const newText =
      req.body.messageText !==
      undefined
        ? String(
            req.body.messageText
          ).trim()
        : undefined;

    const files = req.files || [];
    const removeImages = req.body.removeImages === "true";

    if (
      newText !== undefined &&
      newText.length > MAX_MESSAGE_LENGTH
    ) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 2000 characters.",
      });
    }

    if (files.length > MAX_IMAGES) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message:
          "Maximum 3 images are allowed per message.",
      });
    }

    // update text only
    if (newText !== undefined) {
      if (
        !newText &&
        files.length === 0 &&
        (message.images.length === 0 || removeImages)
      ) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message:
            "Message cannot be empty.",
        });
      }

      message.messageText =
        newText || null;

      message.isEdited = true;
    }

    // Replace existing images, or remove them when explicitly requested.
    if (files.length > 0 || removeImages) {
      for (const oldImage of message.images) {
        oldCloudinaryImages.push(
          oldImage.publicId
        );
      }

      await MessageImage.destroy({
        where: {
          messageId: message.id,
        },
        transaction,
      });

      for (const file of files) {
        const result =
          await uploadImageToCloudinary(
            file,
            `home-service/messages/${message.id}`
          );

        uploadedImages.push(
          result.public_id
        );

        await MessageImage.create(
          {
            messageId: message.id,
            imageUrl: result.secure_url,
            publicId: result.public_id,
          },
          {
            transaction,
          }
        );
      }

      message.isEdited = true;
    }

    await message.save({
      transaction,
    });

    await transaction.commit();

    for (const publicId of oldCloudinaryImages) {
      await deleteCloudinaryImage(
        publicId
      );
    }

    const updatedMessage =
      await Message.findByPk(
        message.id,
        {
          include: messageInclude,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Message updated successfully.",
      data: formatMessage(
        updatedMessage
      ),
    });
  } catch (error) {
    await safeRollback(transaction);

    for (const publicId of uploadedImages) {
      await deleteCloudinaryImage(
        publicId
      );
    }

    next(error);
  }
};

// delete message
const deleteMessage = async (
  req,
  res,
  next
) => {
  const transaction =
    await sequelize.transaction();

  const cloudinaryImages = [];

  try {
    const { messageId } =
      req.params;

    if (!isValidUUID(messageId)) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message =
      await Message.findByPk(
        messageId,
        {
          include: [
            {
              model: MessageImage,
              as: "images",
            },
          ],
          transaction,
        }
      );

    if (!message) {
      await safeRollback(transaction);

      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (message.senderId !== req.user.id) {
      await safeRollback(transaction);

      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own messages.",
      });
    }

    for (const image of message.images) {
      cloudinaryImages.push(
        image.publicId
      );
    }

    await MessageImage.destroy({
      where: {
        messageId: message.id,
      },
      transaction,
    });

    await Message.destroy({
      where: {
        id: message.id,
      },
      transaction,
    });

    await transaction.commit();

    for (const publicId of cloudinaryImages) {
      await deleteCloudinaryImage(
        publicId
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Message deleted successfully.",
    });
  } catch (error) {
    await safeRollback(transaction);

    next(error);
  }
};

// mark message as read
const markMessageAsRead = async (
  req,
  res,
  next
) => {
  try {
    const { messageId } =
      req.params;

    if (!isValidUUID(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message =
      await Message.findByPk(
        messageId
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (message.receiverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Only the receiver can mark this message as read.",
      });
    }

    if (!message.readAt) {
      message.readAt = new Date();

      await message.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "Message marked as read.",
      data: {
        id: message.id,
        readAt: message.readAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDirectMessage,
  getConversationMessages,
  getDirectConversations,
  createMessage,
  getBookingMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
};
