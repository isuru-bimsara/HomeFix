const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    bookingId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "booking_id",
    },

    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sender_id",
    },

    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "receiver_id",
    },

    messageText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "message_text",
    },

    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_edited",
    },

    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "read_at",
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
  },
  {
    tableName: "messages",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["booking_id"],
      },
      {
        fields: ["sender_id"],
      },
      {
        fields: ["receiver_id"],
      },
      {
        fields: ["expires_at"],
      },
    ],
  }
);

module.exports = Message;
