const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
  getAllProviders,
  getProviderById,
} = require("../controllers/provider.controller");

const router = express.Router();

// Get all service providers
router.get(
  "/",
  authenticate,
  getAllProviders
);

// Get one service provider
router.get(
  "/:providerId",
  authenticate,
  getProviderById
);

module.exports = router;