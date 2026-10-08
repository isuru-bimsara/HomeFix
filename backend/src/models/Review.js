const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "customer_id",
    },

    serviceProviderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "service_provider_id",
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
        isInt: true,
      },
    },

    likedTags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: "liked_tags",
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    providerReply: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "provider_reply",
    },

    providerRepliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "provider_replied_at",
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    // Keep the JavaScript attributes as createdAt/updatedAt while mapping
    // them to the snake_case columns that already exist in PostgreSQL.
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["customer_id", "service_provider_id"],
      },
      {
        fields: ["service_provider_id"],
      },
    ],
  }
);

module.exports = Review;
