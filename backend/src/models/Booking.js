const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = sequelize.define(
  "Booking",
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

    problem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "phone_number",
    },

    serviceLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "service_location",
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "ACCEPTED",
        "WORKING",
        "REJECTED",
        "COMPLETED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    providerNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "provider_note",
    },

    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "scheduled_date",
    },

    scheduledTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "scheduled_time",
    },

    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
  },
  {
    tableName: "bookings",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Booking;
