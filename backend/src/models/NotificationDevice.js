const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
module.exports = sequelize.define("NotificationDevice", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: "user_id" },
  pushToken: { type: DataTypes.TEXT, allowNull: false, unique: true, field: "push_token" },
  platform: { type: DataTypes.STRING(20), allowNull: true },
}, { tableName: "notification_devices", timestamps: true, underscored: true });
