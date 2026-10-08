const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
module.exports = sequelize.define("Notification", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: "user_id" },
  type: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(160), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  entityType: { type: DataTypes.STRING(40), allowNull: true, field: "entity_type" },
  entityId: { type: DataTypes.UUID, allowNull: true, field: "entity_id" },
  data: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_read" },
  readAt: { type: DataTypes.DATE, allowNull: true, field: "read_at" },
}, { tableName: "notifications", timestamps: true, underscored: true, indexes: [{ fields: ["user_id", "is_read"] }] });
