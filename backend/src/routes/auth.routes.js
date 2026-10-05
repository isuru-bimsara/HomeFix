const express = require("express");

const {
  register,
  login,
  verifyEmailOtp,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken


} = require("../controllers/auth.controller");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");


// Register
router.post(
  "/register",
  register
);

// Login
router.post(
  "/login",
  login
);

router.post(
  "/refresh-token",
  refreshToken
);

// Logout
router.post(
  "/logout",
  logout
);


router.post("/verify-email", verifyEmailOtp);
router.post("/resend-verification-otp", resendEmailOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, changePassword);


// Insurance partner profile

router.get(
  "/me/insurance-partner-profile",
  authenticate,
  getMyInsurancePartnerProfile
);

router.put(
  "/me/insurance-partner-profile",
  authenticate,
  updateMyInsurancePartnerProfile
);



module.exports = router;
