const User = require("./User");
const CustomerProfile = require("./CustomerProfile");
const ServiceProviderProfile = require("./ServiceProviderProfile");
const RefreshToken = require("./RefreshToken");
const Notification = require("./Notification");
const NotificationDevice = require("./NotificationDevice");
const EmailOtp = require("./EmailOtp");
const InsuranceClaim = require("./InsuranceClaim");
const InsuranceClaimImage = require("./InsuranceClaimImage");
const InsurancePartnerProfile = require("./InsurancePartnerProfile");

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

// insurance claims

User.hasMany(InsuranceClaim, {
  foreignKey: "serviceProviderId",
  as: "providerInsuranceClaims",
});

InsuranceClaim.belongsTo(User, {
  foreignKey: "serviceProviderId",
  as: "serviceProvider",
});

User.hasMany(InsuranceClaim, {
  foreignKey: "reviewedByPartnerId",
  as: "reviewedInsuranceClaims",
});

InsuranceClaim.belongsTo(User, {
  foreignKey: "reviewedByPartnerId",
  as: "reviewedByPartner",
});

// insurance claim images

InsuranceClaim.hasMany(InsuranceClaimImage, {
  foreignKey: "claimId",
  as: "images",
  onDelete: "CASCADE",
});

InsuranceClaimImage.belongsTo(InsuranceClaim, {
  foreignKey: "claimId",
  as: "claim",
});

// insurance partner profile

User.hasOne(InsurancePartnerProfile, {
  foreignKey: "userId",
  as: "insurancePartnerProfile",
  onDelete: "CASCADE",
});

InsurancePartnerProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = {
  user,
  CustomerProfile,
  ServiceProviderProfile,
  RefreshToken,
  InsuranceClaim,
  InsuranceClaimImage,
  InsurancePartnerProfile,

};