const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BookingImage = sequelize.define(
  "BookingImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "booking_id",
    },

    imageType: {
      type: DataTypes.ENUM(
        "CUSTOMER_REQUEST",
        "COMPLETION"
      ),
      allowNull: false,
      field: "image_type",
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
  },
  {
    tableName: "booking_images",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BookingImage;