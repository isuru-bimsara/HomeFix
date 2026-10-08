const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },

    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: "token_hash",
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },

    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "revoked_at",
    },

    replacedByTokenId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "replaced_by_token_id",
    },
  },

  {
    tableName: "refresh_tokens",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = RefreshToken;
