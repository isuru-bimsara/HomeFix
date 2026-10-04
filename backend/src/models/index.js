const User = require("./User");
const CustomerProfile = require("./CustomerProfile");
const ServiceProviderProfile = require("./ServiceProviderProfile");
const RefreshToken = require("./RefreshToken");
const Notification = require("./Notification");
const NotificationDevice = require("./NotificationDevice");
const EmailOtp = require("./EmailOtp");

// customer profile
User.hasMany(Notification, { foreignKey: "userId", as: "notifications", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(NotificationDevice, { foreignKey: "userId", as: "notificationDevices", onDelete: "CASCADE" });
NotificationDevice.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(CustomerProfile, {
  foreignKey: "userId",
  as: "customerProfile",
  onDelete: "CASCADE",
});

User.hasMany(EmailOtp, { foreignKey: "userId", as: "emailOtps", onDelete: "CASCADE" });
EmailOtp.belongsTo(User, { foreignKey: "userId", as: "user" });

CustomerProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// service provider profile
User.hasOne(ServiceProviderProfile, {
  foreignKey: "userId",
  as: "serviceProviderProfile",
  onDelete: "CASCADE",
});

ServiceProviderProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// refresh tokens
User.hasMany(RefreshToken, {
  foreignKey: "userId",
  as: "refreshTokens",
  onDelete: "CASCADE",
});

RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});