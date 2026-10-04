
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,

      set(value) {
        this.setDataValue("email", value.trim().toLowerCase());
      },

      validate: {
        isEmail: true,
      },
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "password_hash",
    },

    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "google_id",
    },

    authProvider: {
      type: DataTypes.ENUM("LOCAL", "GOOGLE"),
      allowNull: false,
      defaultValue: "LOCAL",
      field: "auth_provider",
    },

    role: {
      type: DataTypes.ENUM(
        "CUSTOMER",
        "SERVICE_PROVIDER",
        "ADMIN",
        "CUSTOMER_SERVICE",
        "INSURANCE_PARTNER"
      ),
      allowNull: false,
    },

    accountStatus: {
      type: DataTypes.ENUM("REGISTERED", "BANNED"),
      allowNull: false,
      defaultValue: "REGISTERED",
      field: "account_status",
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_verified",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },

    profileImageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "profile_image_url",
    },

    profileImagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "profile_image_public_id",
    },

    googleProfileImageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "google_profile_image_url",
    },

    profileImageSource: {
      type: DataTypes.ENUM("NONE", "GOOGLE", "CUSTOM"),
      allowNull: false,
      defaultValue: "NONE",
      field: "profile_image_source",
    },
  },

  {
    tableName: "users",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",

    defaultScope: {
      attributes: {
        exclude: ["passwordHash"],
      },
    },
  }
);

module.exports = User;