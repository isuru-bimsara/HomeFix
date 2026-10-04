const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ServiceProviderProfile = sequelize.define(
  "ServiceProviderProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "user_id",
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },

    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "phone_number",
    },

    serviceLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "service_location",
    },

    serviceCategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "service_category",
    },

    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "experience_years",
    },

    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "hourly_rate",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    verificationStatus: {
      type: DataTypes.ENUM(
        "REGISTERED",
        "PROFILE_COMPLETED",
        "PENDING_VERIFICATION",
        "ADMIN_APPROVED",
        "ACTIVE",
        "REJECTED"
      ),
      allowNull: false,
      defaultValue: "REGISTERED",
      field: "verification_status",
    },
  },
  {
    tableName: "service_provider_profiles",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ServiceProviderProfile;
