const express = require("express");
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const bookingRoutes = require("./booking.routes");
const adminRoutes = require("./admin.routes");
const reviewRoutes = require("./review.routes");
const InsuranceClaimRoutes = require("./insurance-claim.routes");
const messageRoutes = require("./message.routes");
const providerRoutes = require("./provider.routes");
const notificationRoutes = require("./notification.routes");

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/booking", bookingRoutes);
router.use("/admin", adminRoutes);
router.use("/reviews", reviewRoutes);
router.use("/insurance-claims", InsuranceClaimRoutes);
router.use("/messages", messageRoutes);
router.use("/providers", providerRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
