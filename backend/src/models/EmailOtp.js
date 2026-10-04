const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmailOtp = sequelize.define("EmailOtp", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: "user_id" },
  purpose: {
    type: DataTypes.ENUM("EMAIL_VERIFICATION", "PASSWORD_RESET"),
    allowNull: false,
  },
  codeHash: { type: DataTypes.STRING(64), allowNull: false, field: "code_hash" },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: "expires_at" },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  lastSentAt: { type: DataTypes.DATE, allowNull: false, field: "last_sent_at" },
}, {
  tableName: "email_otps",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [{ unique: true, fields: ["user_id", "purpose"] }],
});

module.exports = EmailOtp;
