const express = require("express");

const authenticate =
  require("../middleware/auth.middleware");

const upload =
  require("../middleware/upload.middleware");

const {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  removeProfileImage,
} = require("../controllers/profile.controller");

const router =
  express.Router();


// Get current user profile
router.get(
  "/me",
  authenticate,
  getMyProfile
);


// Update profile information
router.put(
  "/me",
  authenticate,
  updateMyProfile
);


// Upload profile image
router.put(
  "/me/image",
  authenticate,
  upload.single("profileImage"),
  uploadProfileImage
);


// Remove custom profile image
router.delete(
  "/me/image",
  authenticate,
  removeProfileImage
);


module.exports = router;