const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MessageImage = sequelize.define(
  "MessageImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "message_id",
    },

    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "image_url",
    },

    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "public_id",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "message_images",

    timestamps: false,
  }
);

module.exports = MessageImage;