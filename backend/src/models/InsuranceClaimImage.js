const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InsuranceClaimImage = sequelize.define(
  "InsuranceClaimImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    claimId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "claim_id",
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
    tableName: "insurance_claim_images",
    timestamps: false,
  }
);

module.exports = InsuranceClaimImage;