const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const {
  getAdminOverview, getAllUsers, getAllCustomers, getAllServiceProviders,
  getAllInsurancePartners, getAllBookings, getAllReviews, getAllInsuranceClaims,
  createUser, createInsurancePartner, banUser, unbanUser,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/overview", getAdminOverview);
router.get("/users", getAllUsers);
router.get("/customers", getAllCustomers);
router.get("/service-providers", getAllServiceProviders);
router.get("/insurance-partners", getAllInsurancePartners);
router.get("/bookings", getAllBookings);
router.get("/reviews", getAllReviews);
router.get("/insurance-claims", getAllInsuranceClaims);

router.post("/users", createUser);
router.post("/insurance-partners", createInsurancePartner);
router.put("/users/:userId/ban", banUser);
router.put("/users/:userId/unban", unbanUser);

module.exports = router;
