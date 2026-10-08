// // // const express = require("express");

// // // const authenticate = require("../middleware/auth.middleware");

// // // const {
// // //   createReview,
// // //   getProviderReviews,
// // //   getMyReviews,
// // //   getReviewById,
// // //   updateReview,
// // //   replyToReview,
// // //   getMyReceivedReviews,
// // // } = require("../controllers/review.controller");

// // // const router = express.Router();

// // // // customer creates review for completed booking
// // // router.post(
// // //   "/booking/:bookingId",
// // //   authenticate,
// // //   createReview
// // // );

// // // // customer gets reviews submitted by themselves
// // // router.get(
// // //   "/my",
// // //   authenticate,
// // //   getMyReviews
// // // );

// // // // provider gets reviews received by themselves
// // // router.get(
// // //   "/my-received",
// // //   authenticate,
// // //   getMyReceivedReviews
// // // );

// // // // public reviews for a provider
// // // router.get(
// // //   "/provider/:providerId",
// // //   authenticate,
// // //   getProviderReviews
// // // );

// // // // get one review
// // // router.get(
// // //   "/:reviewId",
// // //   authenticate,
// // //   getReviewById
// // // );

// // // // customer edits own review
// // // router.put(
// // //   "/:reviewId",
// // //   authenticate,
// // //   updateReview
// // // );

// // // // provider replies to review
// // // router.put(
// // //   "/:reviewId/reply",
// // //   authenticate,
// // //   replyToReview
// // // );

// // // module.exports = router;



// // const express = require("express");

// // const authenticate = require("../middleware/auth.middleware");
// // const upload = require("../middleware/upload.middleware");

// // const {
// //   createReview,
// //   getProviderReviews,
// //   getMyReviews,
// //   getMyReceivedReviews,
// //   getReviewById,
// //   updateReview,
// //   deleteReview,

// //   addReviewImage,
// //   replaceReviewImage,
// //   deleteReviewImage,

// //   createProviderReply,
// //   getProviderReply,
// //   updateProviderReply,
// //   deleteProviderReply,
// // } = require("../controllers/review.controller");

// // const router = express.Router();

// // // customer creates review
// // router.post(
// //   "/booking/:bookingId",
// //   authenticate,
// //   createReview
// // );

// // // customer gets own reviews
// // router.get(
// //   "/my",
// //   authenticate,
// //   getMyReviews
// // );

// // // provider gets own received reviews
// // router.get(
// //   "/my-received",
// //   authenticate,
// //   getMyReceivedReviews
// // );

// // // get reviews of a provider
// // router.get(
// //   "/provider/:providerId",
// //   authenticate,
// //   getProviderReviews
// // );

// // // get one review
// // router.get(
// //   "/:reviewId",
// //   authenticate,
// //   getReviewById
// // );

// // // update review text/rating/tags
// // router.put(
// //   "/:reviewId",
// //   authenticate,
// //   updateReview
// // );

// // // delete complete review
// // router.delete(
// //   "/:reviewId",
// //   authenticate,
// //   deleteReview
// // );

// // // add review image
// // router.post(
// //   "/:reviewId/image",
// //   authenticate,
// //   upload.single("image"),
// //   addReviewImage
// // );

// // // replace review image
// // router.put(
// //   "/:reviewId/image",
// //   authenticate,
// //   upload.single("image"),
// //   replaceReviewImage
// // );

// // // delete review image
// // router.delete(
// //   "/:reviewId/image",
// //   authenticate,
// //   deleteReviewImage
// // );

// // // provider creates reply
// // router.post(
// //   "/:reviewId/reply",
// //   authenticate,
// //   createProviderReply
// // );

// // // get provider reply
// // router.get(
// //   "/:reviewId/reply",
// //   authenticate,
// //   getProviderReply
// // );

// // // provider updates reply
// // router.put(
// //   "/:reviewId/reply",
// //   authenticate,
// //   updateProviderReply
// // );

// // // provider deletes reply
// // router.delete(
// //   "/:reviewId/reply",
// //   authenticate,
// //   deleteProviderReply
// // );

// // module.exports = router;



// const express = require("express");

// const authenticate = require("../middleware/auth.middleware");
// const upload = require("../middleware/upload.middleware");

// const {
//   createReview,
//   getProviderReviews,
//   getMyReviews,
//   getReviewById,
//   updateReview,
//   deleteReview,

//   addReviewImage,
//   updateReviewImage,
//   deleteReviewImage,

//   createProviderReply,
//   updateProviderReply,
//   deleteProviderReply,

//   getMyReceivedReviews,
// } = require("../controllers/review.controller");

// const router = express.Router();

// // create review
// router.post(
//   "/",
//   authenticate,
//   createReview
// );

// // customer's reviews
// router.get(
//   "/my",
//   authenticate,
//   getMyReviews
// );

// // provider's received reviews
// router.get(
//   "/my-received",
//   authenticate,
//   getMyReceivedReviews
// );

// // all reviews
// router.get(
//   "/all",
//   authenticate,
//   getAllReviews
// );

// // all reviews for provider
// router.get(
//   "/provider/:providerId",
//   authenticate,
//   getProviderReviews
// );

// // add review image
// router.post(
//   "/:reviewId/image",
//   authenticate,
//   upload.single("image"),
//   addReviewImage
// );

// // replace review image
// router.put(
//   "/:reviewId/image",
//   authenticate,
//   upload.single("image"),
//   updateReviewImage
// );

// // delete review image
// router.delete(
//   "/:reviewId/image",
//   authenticate,
//   deleteReviewImage
// );

// // provider's own rating
// router.get(
//   "/my-rating",
//   authenticate,
//   getMyRating
// );

// // create provider reply
// router.post(
//   "/:reviewId/reply",
//   authenticate,
//   createProviderReply
// );

// // update provider reply
// router.put(
//   "/:reviewId/reply",
//   authenticate,
//   updateProviderReply
// );

// // delete provider reply
// router.delete(
//   "/:reviewId/reply",
//   authenticate,
//   deleteProviderReply
// );

// // update review
// router.put(
//   "/:reviewId",
//   authenticate,
//   updateReview
// );

// // delete review
// router.delete(
//   "/:reviewId",
//   authenticate,
//   deleteReview
// );

// // get one review
// router.get(
//   "/:reviewId",
//   authenticate,
//   getReviewById
// );

// module.exports = router;



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

const router = express.Router();

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