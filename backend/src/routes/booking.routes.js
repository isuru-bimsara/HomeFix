const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  updateBookingDetails,
  addBookingImages,
  deleteBookingImage,
  acceptBooking,
  startBooking,
  rejectBooking,
  completeBooking,
  updateBookingCompletion,
  deleteBookingCompletion,
  deleteBooking,
} = require("../controllers/booking.controller");

const router = express.Router();

// create booking
router.post(
  "/",
  authenticate,
  upload.array("images", 3),
  createBooking
);

// get my bookings
router.get(
  "/customer/my",
  authenticate,
  getCustomerBookings
);

router.get(
  "/provider/my",
  authenticate,
  getProviderBookings
);

// get one booking
router.get(
  "/:bookingId",
  authenticate,
  getBookingById
);

// update booking details
router.put(
  "/:bookingId/details",
  authenticate,
  updateBookingDetails
);

router.patch(
  "/:bookingId/completion",
  authenticate,
  upload.array("images", 3),
  updateBookingCompletion
);

router.delete(
  "/:bookingId/completion",
  authenticate,
  deleteBookingCompletion
);

// customer adds booking images
router.post(
  "/:bookingId/images",
  authenticate,
  upload.array("images", 3),
  addBookingImages
);

// customer deletes booking image
router.delete(
  "/:bookingId/images/:imageId",
  authenticate,
  deleteBookingImage
);

// provider changes booking status
router.put(
  "/:bookingId/status",
  authenticate,
  acceptBooking
);

router.put("/:bookingId/start", authenticate, startBooking);

// provider rejects booking
router.put(
  "/:bookingId/reject",
  authenticate,
  rejectBooking
);

// provider completes booking
router.put(
  "/:bookingId/complete",
  authenticate,
  upload.array("images", 3),
  completeBooking
);

// customer deletes booking
router.delete(
  "/:bookingId",
  authenticate,
  deleteBooking
);
module.exports = router;
