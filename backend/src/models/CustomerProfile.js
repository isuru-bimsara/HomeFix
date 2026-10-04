const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CustomerProfile = sequelize.define(
  "CustomerProfile",
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

    town: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    homeAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "home_address",
    },
  },

  {
    tableName: "customer_profiles",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = CustomerProfile;