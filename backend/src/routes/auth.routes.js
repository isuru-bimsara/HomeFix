const express = require("express");

const {
  register,
  login,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  googleLogin,
  refreshToken,
  logout,
    googleTestLogin,
    googleTestCallback,

    getMyInsurancePartnerProfile,
    updateMyInsurancePartnerProfile,

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

// Google Login
router.post(
  "/google",
  googleLogin
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
