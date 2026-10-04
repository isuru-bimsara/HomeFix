const express = require("express");

const {
  register,
  login,
  verifyEmailOtp,
  


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


// Logout
router.post(
  "/logout",
  logout
);


router.post("/verify-email", verifyEmailOtp);



// Refresh Access Token
router.post(
  "/refresh",
  refreshToken
);




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
