const express = require("express");

const {
  register,
  verifyEmailOtp,

} = require("../controllers/auth.controller");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");


// Register
router.post(
  "/register",
  register
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
