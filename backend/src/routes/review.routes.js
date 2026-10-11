const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  createReview,

  getProviderReviews,
  getAllReviews,
  getMyReviews,
  getReviewById,

  getMyRating,
  getMyReceivedReviews,

  updateReview,
  deleteReview,

  addReviewImage,
  updateReviewImage,
  deleteReviewImage,

  createProviderReply,
  updateProviderReply,
  deleteProviderReply,
} = require("../controllers/review.controller");

const router = express.cRouter();

// create review
router.post(
  "/",
  authenticate,
  createReview
);

// all reviews
router.get(
  "/all",
  authenticate,
  getAllReviews
);

// customer's reviews
router.get(
  "/my",
  authenticate,
  getMyReviews
);

// provider's own rating
router.get(
  "/my-rating",
  authenticate,
  getMyRating
);

// provider's received reviews
router.get(
  "/my-received",
  authenticate,
  getMyReceivedReviews
);

// all reviews for one provider
router.get(
  "/provider/:providerId",
  authenticate,
  getProviderReviews
);

// add review image
router.post(
  "/:reviewId/image",
  authenticate,
  upload.single("image"),
  addReviewImage
);

// replace review image
router.put(
  "/:reviewId/image",
  authenticate,
  upload.single("image"),
  updateReviewImage
);

// delete review image
router.delete(
  "/:reviewId/image",
  authenticate,
  deleteReviewImage
);

// create provider reply
router.post(
  "/:reviewId/reply",
  authenticate,
  createProviderReply
);

// update provider reply
router.put(
  "/:reviewId/reply",
  authenticate,
  updateProviderReply
);

// delete provider reply
router.delete(
  "/:reviewId/reply",
  authenticate,
  deleteProviderReply
);

// update review
router.put(
  "/:reviewId",
  authenticate,
  updateReview
);

// delete review
router.delete(
  "/:reviewId",
  authenticate,
  deleteReview
);

// get one review
router.get(
  "/:reviewId",
  authenticate,
  getReviewById
);

module.exports = router;