// // const {
// //   Review,
// //   Booking,
// //   User,
// //   CustomerProfile,
// //   ServiceProviderProfile,
// // } = require("../models");

// // const ALLOWED_TAGS = [
// //   "PROFESSIONAL",
// //   "ON_TIME",
// //   "CLEAN_WORK",
// //   "FRIENDLY",
// //   "GOOD_VALUE",
// //   "SKILLED",
// // ];

// // const MAX_COMMENT_LENGTH = 500;
// // const EDIT_WINDOW_DAYS = 7;

// // function validateTags(tags) {
// //   if (!Array.isArray(tags)) {
// //     return false;
// //   }

// //   if (tags.length > 6) {
// //     return false;
// //   }

// //   return tags.every((tag) => ALLOWED_TAGS.includes(tag));
// // }

// // function formatCustomerName(profile) {
// //   if (!profile) {
// //     return "Customer";
// //   }

// //   const firstName = profile.firstName || "";
// //   const lastName = profile.lastName || "";

// //   if (!firstName) {
// //     return "Customer";
// //   }

// //   if (!lastName) {
// //     return firstName;
// //   }

// //   return `${firstName} ${lastName.charAt(0)}.`;
// // }

// // // create review
// // const createReview = async (req, res, next) => {
// //   try {
// //     const { bookingId } = req.params;

// //     const {
// //       rating,
// //       likedTags = [],
// //       comment,
// //     } = req.body;

// //     if (req.user.role !== "CUSTOMER") {
// //       return res.status(403).json({
// //         success: false,
// //         message: "Only customers can submit reviews.",
// //       });
// //     }

// //     const booking = await Booking.findByPk(bookingId);

// //     if (!booking) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Booking not found.",
// //       });
// //     }

// //     if (booking.customerId !== req.user.id) {
// //       return res.status(403).json({
// //         success: false,
// //         message: "You can only review your own booking.",
// //       });
// //     }

// //     if (booking.status !== "COMPLETED") {
// //       return res.status(400).json({
// //         success: false,
// //         message: "You can review a booking only after it is completed.",
// //       });
// //     }

// //     const existingReview = await Review.findOne({
// //       where: {
// //         bookingId,
// //       },
// //     });

// //     if (existingReview) {
// //       return res.status(409).json({
// //         success: false,
// //         message: "You have already reviewed this booking.",
// //       });
// //     }

// //     const numericRating = Number(rating);

// //     if (
// //       !Number.isInteger(numericRating) ||
// //       numericRating < 1 ||
// //       numericRating > 5
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Rating must be an integer between 1 and 5.",
// //       });
// //     }

// //     if (!validateTags(likedTags)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid review tags.",
// //       });
// //     }

// //     const cleanComment =
// //       comment !== undefined && comment !== null
// //         ? String(comment).trim()
// //         : null;

// //     if (cleanComment && cleanComment.length > MAX_COMMENT_LENGTH) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
// //       });
// //     }

// //     if (!cleanComment && likedTags.length === 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Please select at least one tag or write a comment.",
// //       });
// //     }

// //     const customer = await User.findByPk(req.user.id);

// //     if (
// //       !customer ||
// //       customer.accountStatus === "BANNED" ||
// //       customer.isActive === false
// //     ) {
// //       return res.status(403).json({
// //         success: false,
// //         message: "Your account is not allowed to submit reviews.",
// //       });
// //     }

// //     const provider = await User.findOne({
// //       where: {
// //         id: booking.serviceProviderId,
// //         role: "SERVICE_PROVIDER",
// //       },
// //     });

// //     if (!provider) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Service provider not found.",
// //       });
// //     }

// //     const review = await Review.create({
// //       bookingId: booking.id,
// //       customerId: booking.customerId,
// //       serviceProviderId: booking.serviceProviderId,
// //       rating: numericRating,
// //       likedTags,
// //       comment: cleanComment,
// //     });

// //     return res.status(201).json({
// //       success: true,
// //       message: "Review submitted successfully.",
// //       review,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // // get reviews received by a provider
// // const getProviderReviews = async (req, res, next) => {
// //   try {
// //     const { providerId } = req.params;

// //     const provider = await User.findOne({
// //       where: {
// //         id: providerId,
// //         role: "SERVICE_PROVIDER",
// //       },
// //       include: [
// //         {
// //           model: ServiceProviderProfile,
// //           as: "serviceProviderProfile",
// //         },
// //       ],
// //     });

// //     if (!provider) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Service provider not found.",
// //       });
// //     }

// //     const reviews = await Review.findAll({
// //       where: {
// //         serviceProviderId: providerId,
// //       },
// //       include: [
// //         {
// //           model: User,
// //           as: "customer",
// //           attributes: ["id"],
// //           include: [
// //             {
// //               model: CustomerProfile,
// //               as: "customerProfile",
// //               attributes: ["firstName", "lastName"],
// //             },
// //           ],
// //         },
// //       ],
// //       order: [["created_at", "DESC"]],
// //     });

// //     const reviewCount = reviews.length;

// //     const totalRating = reviews.reduce(
// //       (total, review) => total + review.rating,
// //       0
// //     );

// //     const averageRating =
// //       reviewCount > 0
// //         ? Number((totalRating / reviewCount).toFixed(1))
// //         : 0;

// //     const ratingBreakdown = {
// //       5: reviews.filter((review) => review.rating === 5).length,
// //       4: reviews.filter((review) => review.rating === 4).length,
// //       3: reviews.filter((review) => review.rating === 3).length,
// //       2: reviews.filter((review) => review.rating === 2).length,
// //       1: reviews.filter((review) => review.rating === 1).length,
// //     };

// //     const formattedReviews = reviews.map((review) => ({
// //       id: review.id,
// //       bookingId: review.bookingId,
// //       rating: review.rating,
// //       likedTags: review.likedTags,
// //       comment: review.comment,
// //       providerReply: review.providerReply,
// //       providerRepliedAt: review.providerRepliedAt,
// //       customer: {
// //         id: review.customer?.id,
// //         name: formatCustomerName(
// //           review.customer?.customerProfile
// //         ),
// //       },
// //       createdAt: review.createdAt,
// //       updatedAt: review.updatedAt,
// //     }));

// //     return res.status(200).json({
// //       success: true,
// //       provider: {
// //         id: provider.id,
// //         serviceProviderProfile:
// //           provider.serviceProviderProfile,
// //       },
// //       summary: {
// //         averageRating,
// //         reviewCount,
// //         ratingBreakdown,
// //       },
// //       reviews: formattedReviews,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // // customer gets reviews submitted by themselves
// // const getMyReviews = async (req, res, next) => {
// //   try {
// //     if (req.user.role !== "CUSTOMER") {
// //       return res.status(403).json({
// //         success: false,
// //         message: "Only customers can view their submitted reviews.",
// //       });
// //     }

// //     const reviews = await Review.findAll({
// //       where: {
// //         customerId: req.user.id,
// //       },
// //       include: [
// //         {
// //           model: User,
// //           as: "serviceProvider",
// //           attributes: ["id", "email", "profileImageUrl"],
// //           include: [
// //             {
// //               model: ServiceProviderProfile,
// //               as: "serviceProviderProfile",
// //               attributes: [
// //                 "firstName",
// //                 "lastName",
// //                 "serviceCategory",
// //               ],
// //             },
// //           ],
// //         },
// //         {
// //           model: Booking,
// //           as: "booking",
// //           attributes: [
// //             "id",
// //             "problem",
// //             "serviceLocation",
// //             "status",
// //             "completedAt",
// //           ],
// //         },
// //       ],
// //       order: [["created_at", "DESC"]],
// //     });

// //     return res.status(200).json({
// //       success: true,
// //       count: reviews.length,
// //       reviews,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // // get one review
// // const getReviewById = async (req, res, next) => {
// //   try {
// //     const { reviewId } = req.params;

// //     const review = await Review.findByPk(reviewId, {
// //       include: [
// //         {
// //           model: User,
// //           as: "customer",
// //           attributes: ["id"],
// //           include: [
// //             {
// //               model: CustomerProfile,
// //               as: "customerProfile",
// //               attributes: ["firstName", "lastName"],
// //             },
// //           ],
// //         },
// //         {
// //           model: User,
// //           as: "serviceProvider",
// //           attributes: ["id", "email", "profileImageUrl"],
// //           include: [
// //             {
// //               model: ServiceProviderProfile,
// //               as: "serviceProviderProfile",
// //             },
// //           ],
// //         },
// //         {
// //           model: Booking,
// //           as: "booking",
// //           attributes: [
// //             "id",
// //             "problem",
// //             "status",
// //             "completedAt",
// //           ],
// //         },
// //       ],
// //     });

// //     if (!review) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Review not found.",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       review,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // // customer edits review
// // const updateReview = async (req, res, next) => {
// //   try {
// //     const { reviewId } = req.params;

// //     const {
// //       rating,
// //       likedTags,
// //       comment,
// //     } = req.body;

// //     if (req.user.role !== "CUSTOMER") {
// //       return res.status(403).json({
// //         success: false,
// //         message: "Only customers can update reviews.",
// //       });
// //     }

// //     const review = await Review.findByPk(reviewId);

// //     if (!review) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Review not found.",
// //       });
// //     }

// //     if (review.customerId !== req.user.id) {
// //       return res.status(403).json({
// //         success: false,
// //         message: "You can only update your own review.",
// //       });
// //     }

// //     const createdAt = new Date(review.createdAt);
// //     const now = new Date();

// //     const differenceInDays =
// //       (now - createdAt) / (1000 * 60 * 60 * 24);

// //     if (differenceInDays > EDIT_WINDOW_DAYS) {
// //       return res.status(403).json({
// //         success: false,
// //         message:
// //           "Reviews can only be edited within 7 days of submission.",
// //       });
// //     }

// //     if (rating !== undefined) {
// //       const numericRating = Number(rating);

// //       if (
// //         !Number.isInteger(numericRating) ||
// //         numericRating < 1 ||
// //         numericRating > 5
// //       ) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Rating must be an integer between 1 and 5.",
// //         });
// //       }

// //       review.rating = numericRating;
// //     }

// //     if (likedTags !== undefined) {
// //       if (!validateTags(likedTags)) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Invalid review tags.",
// //         });
// //       }

// //       review.likedTags = likedTags;
// //     }

// //     if (comment !== undefined) {
// //       const cleanComment =
// //         comment !== null
// //           ? String(comment).trim()
// //           : null;

// //       if (
// //         cleanComment &&
// //         cleanComment.length > MAX_COMMENT_LENGTH
// //       ) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
// //         });
// //       }

// //       review.comment = cleanComment;
// //     }

// //     if (
// //       (!review.comment || !review.comment.trim()) &&
// //       (!review.likedTags || review.likedTags.length === 0)
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message:
// //           "Please select at least one tag or write a comment.",
// //       });
// //     }

// //     await review.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Review updated successfully.",
// //       review,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // // provider replies to review
// // const replyToReview = async (req, res, next) => {
// //   try {
// //     const { reviewId } = req.params;
// //     const { providerReply } = req.body;

// //     if (req.user.role !== "SERVICE_PROVIDER") {
// //       return res.status(403).json({
// //         success: false,
// //         message: "Only service providers can reply to reviews.",
// //       });
// //     }

// //     const review = await Review.findByPk(reviewId);

// //     if (!review) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Review not found.",
// //       });
// //     }

// //     if (review.serviceProviderId !== req.user.id) {
// //       return res.status(403).json({
// //         success: false,
// //         message:
// //           "You can only reply to reviews received by you.",
// //       });
// //     }

// //     if (
// //       !providerReply ||
// //       !providerReply.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Provider reply is required.",
// //       });
// //     }

// //     if (providerReply.trim().length > 500) {
// //       return res.status(400).json({
// //         success: false,
// //         message:
// //           "Provider reply cannot exceed 500 characters.",
// //       });
// //     }

// //     const provider = await User.findByPk(req.user.id);

// //     if (
// //       !provider ||
// //       provider.accountStatus === "BANNED" ||
// //       provider.isActive === false
// //     ) {
// //       return res.status(403).json({
// //         success: false,
// //         message:
// //           "Your account is not allowed to reply to reviews.",
// //       });
// //     }

// //     review.providerReply = providerReply.trim();
// //     review.providerRepliedAt = new Date();

// //     await review.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Reply added successfully.",
// //       review,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // // provider gets only reviews received by themselves
// // const getMyReceivedReviews = async (req, res, next) => {
// //   try {
// //     if (req.user.role !== "SERVICE_PROVIDER") {
// //       return res.status(403).json({
// //         success: false,
// //         message:
// //           "Only service providers can view received reviews.",
// //       });
// //     }

// //     const reviews = await Review.findAll({
// //       where: {
// //         serviceProviderId: req.user.id,
// //       },
// //       include: [
// //         {
// //           model: User,
// //           as: "customer",
// //           attributes: ["id"],
// //           include: [
// //             {
// //               model: CustomerProfile,
// //               as: "customerProfile",
// //               attributes: ["firstName", "lastName"],
// //             },
// //           ],
// //         },
// //       ],
// //       order: [["created_at", "DESC"]],
// //     });

// //     const reviewCount = reviews.length;

// //     const totalRating = reviews.reduce(
// //       (total, review) => total + review.rating,
// //       0
// //     );

// //     const averageRating =
// //       reviewCount > 0
// //         ? Number((totalRating / reviewCount).toFixed(1))
// //         : 0;

// //     return res.status(200).json({
// //       success: true,
// //       summary: {
// //         averageRating,
// //         reviewCount,
// //       },
// //       reviews,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // module.exports = {
// //   createReview,
// //   getProviderReviews,
// //   getMyReviews,
// //   getReviewById,
// //   updateReview,
// //   replyToReview,
// //   getMyReceivedReviews,
// // };


// const {
//   Review,
//   Booking,
//   User,
//   CustomerProfile,
//   ServiceProviderProfile,
// } = require("../models");

// const {
//   uploadImageToCloudinary,
//   deleteCloudinaryImage,
// } = require("../utils/cloudinary-upload");

// const ALLOWED_TAGS = [
//   "PROFESSIONAL",
//   "ON_TIME",
//   "CLEAN_WORK",
//   "FRIENDLY",
//   "GOOD_VALUE",
//   "SKILLED",
// ];

// const MAX_COMMENT_LENGTH = 500;
// const MAX_REPLY_LENGTH = 500;
// const EDIT_WINDOW_DAYS = 7;

// function validateTags(tags) {
//   if (!Array.isArray(tags)) {
//     return false;
//   }

//   if (tags.length > 6) {
//     return false;
//   }

//   return tags.every((tag) => ALLOWED_TAGS.includes(tag));
// }

// function formatCustomerName(profile) {
//   if (!profile) {
//     return "Customer";
//   }

//   const firstName = profile.firstName || "";
//   const lastName = profile.lastName || "";

//   if (!firstName) {
//     return "Customer";
//   }

//   if (!lastName) {
//     return firstName;
//   }

//   return `${firstName} ${lastName.charAt(0)}.`;
// }

// // create review
// const createReview = async (req, res, next) => {
//   try {
//     const { bookingId } = req.params;

//     const {
//       rating,
//       likedTags = [],
//       comment,
//     } = req.body;

//     if (req.user.role !== "CUSTOMER") {
//       return res.status(403).json({
//         success: false,
//         message: "Only customers can submit reviews.",
//       });
//     }

//     const booking = await Booking.findByPk(bookingId);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found.",
//       });
//     }

//     if (booking.customerId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only review your own booking.",
//       });
//     }

//     if (booking.status !== "COMPLETED") {
//       return res.status(400).json({
//         success: false,
//         message: "You can review a booking only after it is completed.",
//       });
//     }

//     const existingReview = await Review.findOne({
//       where: {
//         bookingId,
//       },
//     });

//     if (existingReview) {
//       return res.status(409).json({
//         success: false,
//         message: "You have already reviewed this booking.",
//       });
//     }

//     const numericRating = Number(rating);

//     if (
//       !Number.isInteger(numericRating) ||
//       numericRating < 1 ||
//       numericRating > 5
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Rating must be an integer between 1 and 5.",
//       });
//     }

//     if (!validateTags(likedTags)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid review tags.",
//       });
//     }

//     const cleanComment =
//       comment !== undefined && comment !== null
//         ? String(comment).trim()
//         : null;

//     if (
//       cleanComment &&
//       cleanComment.length > MAX_COMMENT_LENGTH
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
//       });
//     }

//     if (!cleanComment && likedTags.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please select at least one tag or write a comment.",
//       });
//     }

//     const customer = await User.findByPk(req.user.id);

//     if (
//       !customer ||
//       customer.accountStatus === "BANNED" ||
//       customer.isActive === false
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "Your account is not allowed to submit reviews.",
//       });
//     }

//     const provider = await User.findOne({
//       where: {
//         id: booking.serviceProviderId,
//         role: "SERVICE_PROVIDER",
//       },
//     });

//     if (!provider) {
//       return res.status(404).json({
//         success: false,
//         message: "Service provider not found.",
//       });
//     }

//     const review = await Review.create({
//       bookingId: booking.id,
//       customerId: booking.customerId,
//       serviceProviderId: booking.serviceProviderId,
//       rating: numericRating,
//       likedTags,
//       comment: cleanComment,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Review submitted successfully.",
//       review,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // get reviews for a provider
// const getProviderReviews = async (req, res, next) => {
//   try {
//     const { providerId } = req.params;

//     const provider = await User.findOne({
//       where: {
//         id: providerId,
//         role: "SERVICE_PROVIDER",
//       },
//       include: [
//         {
//           model: ServiceProviderProfile,
//           as: "serviceProviderProfile",
//         },
//       ],
//     });

//     if (!provider) {
//       return res.status(404).json({
//         success: false,
//         message: "Service provider not found.",
//       });
//     }

//     const reviews = await Review.findAll({
//       where: {
//         serviceProviderId: providerId,
//       },
//       include: [
//         {
//           model: User,
//           as: "customer",
//           attributes: ["id"],
//           include: [
//             {
//               model: CustomerProfile,
//               as: "customerProfile",
//               attributes: ["firstName", "lastName"],
//             },
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const reviewCount = reviews.length;

//     const totalRating = reviews.reduce(
//       (total, review) => total + review.rating,
//       0
//     );

//     const averageRating =
//       reviewCount > 0
//         ? Number((totalRating / reviewCount).toFixed(1))
//         : 0;

//     const ratingBreakdown = {
//       5: reviews.filter((review) => review.rating === 5).length,
//       4: reviews.filter((review) => review.rating === 4).length,
//       3: reviews.filter((review) => review.rating === 3).length,
//       2: reviews.filter((review) => review.rating === 2).length,
//       1: reviews.filter((review) => review.rating === 1).length,
//     };

//     const formattedReviews = reviews.map((review) => ({
//       id: review.id,
//       bookingId: review.bookingId,
//       rating: review.rating,
//       likedTags: review.likedTags,
//       comment: review.comment,

//       image: review.imageUrl
//         ? {
//             url: review.imageUrl,
//             publicId: review.imagePublicId,
//           }
//         : null,

//       providerReply: review.providerReply,
//       providerRepliedAt: review.providerRepliedAt,

//       customer: {
//         id: review.customer?.id,
//         name: formatCustomerName(
//           review.customer?.customerProfile
//         ),
//       },

//       createdAt: review.createdAt,
//       updatedAt: review.updatedAt,
//     }));

//     return res.status(200).json({
//       success: true,

//       provider: {
//         id: provider.id,
//         serviceProviderProfile:
//           provider.serviceProviderProfile,
//       },

//       summary: {
//         averageRating,
//         reviewCount,
//         ratingBreakdown,
//       },

//       reviews: formattedReviews,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // customer gets own reviews
// const getMyReviews = async (req, res, next) => {
//   try {
//     if (req.user.role !== "CUSTOMER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only customers can view their submitted reviews.",
//       });
//     }

//     const reviews = await Review.findAll({
//       where: {
//         customerId: req.user.id,
//       },
//       include: [
//         {
//           model: User,
//           as: "serviceProvider",
//           attributes: ["id", "email", "profileImageUrl"],
//           include: [
//             {
//               model: ServiceProviderProfile,
//               as: "serviceProviderProfile",
//               attributes: [
//                 "firstName",
//                 "lastName",
//                 "serviceCategory",
//               ],
//             },
//           ],
//         },
//         {
//           model: Booking,
//           as: "booking",
//           attributes: [
//             "id",
//             "problem",
//             "serviceLocation",
//             "status",
//             "completedAt",
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.status(200).json({
//       success: true,
//       count: reviews.length,
//       reviews,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // provider gets own received reviews
// const getMyReceivedReviews = async (req, res, next) => {
//   try {
//     if (req.user.role !== "SERVICE_PROVIDER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only service providers can view received reviews.",
//       });
//     }

//     const reviews = await Review.findAll({
//       where: {
//         serviceProviderId: req.user.id,
//       },
//       include: [
//         {
//           model: User,
//           as: "customer",
//           attributes: ["id"],
//           include: [
//             {
//               model: CustomerProfile,
//               as: "customerProfile",
//               attributes: ["firstName", "lastName"],
//             },
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const reviewCount = reviews.length;

//     const totalRating = reviews.reduce(
//       (total, review) => total + review.rating,
//       0
//     );

//     const averageRating =
//       reviewCount > 0
//         ? Number((totalRating / reviewCount).toFixed(1))
//         : 0;

//     return res.status(200).json({
//       success: true,

//       summary: {
//         averageRating,
//         reviewCount,
//       },

//       reviews,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // get one review
// const getReviewById = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;

//     const review = await Review.findByPk(reviewId, {
//       include: [
//         {
//           model: User,
//           as: "customer",
//           attributes: ["id"],
//           include: [
//             {
//               model: CustomerProfile,
//               as: "customerProfile",
//             },
//           ],
//         },
//         {
//           model: User,
//           as: "serviceProvider",
//           attributes: ["id", "email", "profileImageUrl"],
//           include: [
//             {
//               model: ServiceProviderProfile,
//               as: "serviceProviderProfile",
//             },
//           ],
//         },
//         {
//           model: Booking,
//           as: "booking",
//           attributes: [
//             "id",
//             "problem",
//             "status",
//             "completedAt",
//           ],
//         },
//       ],
//     });

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       review,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // update review
// const updateReview = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;

//     const {
//       rating,
//       likedTags,
//       comment,
//     } = req.body;

//     if (req.user.role !== "CUSTOMER") {
//       return res.status(403).json({
//         success: false,
//         message: "Only customers can update reviews.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.customerId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only update your own review.",
//       });
//     }

//     const createdAt = new Date(review.createdAt);
//     const now = new Date();

//     const differenceInDays =
//       (now - createdAt) / (1000 * 60 * 60 * 24);

//     if (differenceInDays > EDIT_WINDOW_DAYS) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Reviews can only be edited within 7 days of submission.",
//       });
//     }

//     if (rating !== undefined) {
//       const numericRating = Number(rating);

//       if (
//         !Number.isInteger(numericRating) ||
//         numericRating < 1 ||
//         numericRating > 5
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Rating must be an integer between 1 and 5.",
//         });
//       }

//       review.rating = numericRating;
//     }

//     if (likedTags !== undefined) {
//       if (!validateTags(likedTags)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid review tags.",
//         });
//       }

//       review.likedTags = likedTags;
//     }

//     if (comment !== undefined) {
//       const cleanComment =
//         comment !== null
//           ? String(comment).trim()
//           : null;

//       if (
//         cleanComment &&
//         cleanComment.length > MAX_COMMENT_LENGTH
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
//         });
//       }

//       review.comment = cleanComment;
//     }

//     if (
//       (!review.comment || !review.comment.trim()) &&
//       (!review.likedTags ||
//         review.likedTags.length === 0)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please select at least one tag or write a comment.",
//       });
//     }

//     await review.save();

//     return res.status(200).json({
//       success: true,
//       message: "Review updated successfully.",
//       review,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // delete review
// const deleteReview = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;

//     if (req.user.role !== "CUSTOMER") {
//       return res.status(403).json({
//         success: false,
//         message: "Only customers can delete reviews.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.customerId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only delete your own review.",
//       });
//     }

//     if (review.imagePublicId) {
//       await deleteCloudinaryImage(
//         review.imagePublicId
//       );
//     }

//     await review.destroy();

//     return res.status(200).json({
//       success: true,
//       message: "Review deleted successfully.",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // add review image
// const addReviewImage = async (req, res, next) => {
//   let uploadedPublicId = null;

//   try {
//     const { reviewId } = req.params;

//     if (req.user.role !== "CUSTOMER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only customers can add review images.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.customerId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "You can only add images to your own review.",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Please select an image.",
//       });
//     }

//     if (review.imageUrl) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "This review already has an image. Use the replace image endpoint.",
//       });
//     }

//     const result = await uploadImageToCloudinary(
//       req.file,
//       `home-service/reviews/${review.id}`
//     );

//     uploadedPublicId = result.public_id;

//     review.imageUrl = result.secure_url;
//     review.imagePublicId = result.public_id;

//     await review.save();

//     return res.status(200).json({
//       success: true,
//       message: "Review image added successfully.",
//       image: {
//         url: review.imageUrl,
//         publicId: review.imagePublicId,
//       },
//     });
//   } catch (error) {
//     if (uploadedPublicId) {
//       await deleteCloudinaryImage(uploadedPublicId);
//     }

//     next(error);
//   }
// };

// // replace review image
// const replaceReviewImage = async (req, res, next) => {
//   let newPublicId = null;

//   try {
//     const { reviewId } = req.params;

//     if (req.user.role !== "CUSTOMER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only customers can replace review images.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.customerId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "You can only replace the image of your own review.",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Please select a new image.",
//       });
//     }

//     if (!review.imagePublicId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This review does not have an image. Use the add image endpoint.",
//       });
//     }

//     const oldPublicId = review.imagePublicId;

//     const result = await uploadImageToCloudinary(
//       req.file,
//       `home-service/reviews/${review.id}`
//     );

//     newPublicId = result.public_id;

//     review.imageUrl = result.secure_url;
//     review.imagePublicId = result.public_id;

//     await review.save();

//     await deleteCloudinaryImage(oldPublicId);

//     return res.status(200).json({
//       success: true,
//       message: "Review image replaced successfully.",
//       image: {
//         url: review.imageUrl,
//         publicId: review.imagePublicId,
//       },
//     });
//   } catch (error) {
//     if (newPublicId) {
//       await deleteCloudinaryImage(newPublicId);
//     }

//     next(error);
//   }
// };

// // delete review image
// const deleteReviewImage = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;

//     if (req.user.role !== "CUSTOMER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only customers can delete review images.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.customerId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "You can only delete the image from your own review.",
//       });
//     }

//     if (!review.imagePublicId) {
//       return res.status(404).json({
//         success: false,
//         message: "This review does not have an image.",
//       });
//     }

//     const publicId = review.imagePublicId;

//     review.imageUrl = null;
//     review.imagePublicId = null;

//     await review.save();

//     await deleteCloudinaryImage(publicId);

//     return res.status(200).json({
//       success: true,
//       message: "Review image deleted successfully.",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // create provider reply
// const createProviderReply = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;
//     const { providerReply } = req.body;

//     if (req.user.role !== "SERVICE_PROVIDER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only service providers can reply to reviews.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.serviceProviderId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "You can only reply to reviews received by you.",
//       });
//     }

//     if (review.providerReply) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "A reply already exists. Use the update reply endpoint.",
//       });
//     }

//     if (
//       !providerReply ||
//       !providerReply.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Provider reply is required.",
//       });
//     }

//     if (providerReply.trim().length > MAX_REPLY_LENGTH) {
//       return res.status(400).json({
//         success: false,
//         message:
//           `Provider reply cannot exceed ${MAX_REPLY_LENGTH} characters.`,
//       });
//     }

//     const provider = await User.findByPk(req.user.id);

//     if (
//       !provider ||
//       provider.accountStatus === "BANNED" ||
//       provider.isActive === false
//     ) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Your account is not allowed to reply to reviews.",
//       });
//     }

//     review.providerReply = providerReply.trim();
//     review.providerRepliedAt = new Date();

//     await review.save();

//     return res.status(201).json({
//       success: true,
//       message: "Provider reply added successfully.",
//       reply: {
//         text: review.providerReply,
//         repliedAt: review.providerRepliedAt,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // get provider reply
// const getProviderReply = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (!review.providerReply) {
//       return res.status(404).json({
//         success: false,
//         message: "Provider reply not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       reply: {
//         text: review.providerReply,
//         repliedAt: review.providerRepliedAt,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // update provider reply
// const updateProviderReply = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;
//     const { providerReply } = req.body;

//     if (req.user.role !== "SERVICE_PROVIDER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only service providers can update replies.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.serviceProviderId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "You can only update replies to your own reviews.",
//       });
//     }

//     if (!review.providerReply) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Provider reply does not exist.",
//       });
//     }

//     if (
//       !providerReply ||
//       !providerReply.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Provider reply is required.",
//       });
//     }

//     if (providerReply.trim().length > MAX_REPLY_LENGTH) {
//       return res.status(400).json({
//         success: false,
//         message:
//           `Provider reply cannot exceed ${MAX_REPLY_LENGTH} characters.`,
//       });
//     }

//     review.providerReply = providerReply.trim();
//     review.providerRepliedAt = new Date();

//     await review.save();

//     return res.status(200).json({
//       success: true,
//       message: "Provider reply updated successfully.",
//       reply: {
//         text: review.providerReply,
//         repliedAt: review.providerRepliedAt,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // delete provider reply
// const deleteProviderReply = async (req, res, next) => {
//   try {
//     const { reviewId } = req.params;

//     if (req.user.role !== "SERVICE_PROVIDER") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Only service providers can delete replies.",
//       });
//     }

//     const review = await Review.findByPk(reviewId);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: "Review not found.",
//       });
//     }

//     if (review.serviceProviderId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "You can only delete replies to your own reviews.",
//       });
//     }

//     if (!review.providerReply) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Provider reply does not exist.",
//       });
//     }

//     review.providerReply = null;
//     review.providerRepliedAt = null;

//     await review.save();

//     return res.status(200).json({
//       success: true,
//       message: "Provider reply deleted successfully.",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createReview,
//   getProviderReviews,
//   getMyReviews,
//   getMyReceivedReviews,
//   getReviewById,
//   updateReview,
//   deleteReview,

//   addReviewImage,
//   replaceReviewImage,
//   deleteReviewImage,

//   createProviderReply,
//   getProviderReply,
//   updateProviderReply,
//   deleteProviderReply,
// };



const {
  Review,
  ReviewImage,
  User,
  CustomerProfile,
  ServiceProviderProfile,
} = require("../models");

const {
  uploadImageToCloudinary,
  deleteCloudinaryImage,
} = require("../utils/cloudinary-upload");

const ALLOWED_TAGS = [
  "PROFESSIONAL",
  "ON_TIME",
  "CLEAN_WORK",
  "FRIENDLY",
  "GOOD_VALUE",
  "SKILLED",
];

const MAX_COMMENT_LENGTH = 500;
const MAX_REPLY_LENGTH = 500;

function validateTags(tags) {
  if (!Array.isArray(tags)) {
    return false;
  }

  if (tags.length > 6) {
    return false;
  }

  return tags.every((tag) => ALLOWED_TAGS.includes(tag));
}

function formatCustomerName(profile) {
  if (!profile) {
    return "Customer";
  }

  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";

  if (!firstName) {
    return "Customer";
  }

  if (!lastName) {
    return firstName;
  }

  return `${firstName} ${lastName.charAt(0)}.`;
}

// create review
const createReview = async (req, res, next) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can create reviews.",
      });
    }

    const {
      serviceProviderId,
      rating,
      likedTags = [],
      comment,
    } = req.body;

    if (!serviceProviderId) {
      return res.status(400).json({
        success: false,
        message: "Service provider ID is required.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    if (!validateTags(likedTags)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review tags.",
      });
    }

    const cleanComment =
      comment !== undefined && comment !== null
        ? String(comment).trim()
        : null;

    if (cleanComment && cleanComment.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
      });
    }

    if (!cleanComment && likedTags.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one option or write a comment.",
      });
    }

    const customer = await User.findByPk(req.user.id);

    if (
      !customer ||
      customer.accountStatus === "BANNED" ||
      customer.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is not allowed to create reviews.",
      });
    }

    const provider = await User.findOne({
      where: {
        id: serviceProviderId,
        role: "SERVICE_PROVIDER",
      },
      include: [
        {
          model: ServiceProviderProfile,
          as: "serviceProviderProfile",
        },
      ],
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found.",
      });
    }

    if (
      provider.accountStatus === "BANNED" ||
      provider.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message: "This service provider is not available.",
      });
    }

    const existingReview = await Review.findOne({
      where: {
        customerId: req.user.id,
        serviceProviderId,
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message:
          "You have already submitted a review for this service provider.",
      });
    }

    const review = await Review.create({
      customerId: req.user.id,
      serviceProviderId,
      rating: numericRating,
      likedTags,
      comment: cleanComment,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// get all reviews for provider
const getProviderReviews = async (req, res, next) => {
  try {
    const { providerId } = req.params;

    const provider = await User.findOne({
      where: {
        id: providerId,
        role: "SERVICE_PROVIDER",
      },
      include: [
        {
          model: ServiceProviderProfile,
          as: "serviceProviderProfile",
        },
      ],
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found.",
      });
    }

    const reviews = await Review.findAll({
      where: {
        serviceProviderId: providerId,
      },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id"],
          include: [
            {
              model: CustomerProfile,
              as: "customerProfile",
              attributes: ["firstName", "lastName"],
            },
          ],
        },
        {
          model: ReviewImage,
          as: "image",
          attributes: [
            "id",
            "imageUrl",
            "createdAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const reviewCount = reviews.length;

    const totalRating = reviews.reduce(
      (total, review) => total + review.rating,
      0
    );

    const averageRating =
      reviewCount > 0
        ? Number((totalRating / reviewCount).toFixed(1))
        : 0;

    const ratingBreakdown = {
      5: reviews.filter((review) => review.rating === 5).length,
      4: reviews.filter((review) => review.rating === 4).length,
      3: reviews.filter((review) => review.rating === 3).length,
      2: reviews.filter((review) => review.rating === 2).length,
      1: reviews.filter((review) => review.rating === 1).length,
    };

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      likedTags: review.likedTags,
      comment: review.comment,

      image: review.image
        ? {
            id: review.image.id,
            imageUrl: review.image.imageUrl,
            createdAt: review.image.createdAt,
          }
        : null,

      providerReply: review.providerReply,
      providerRepliedAt: review.providerRepliedAt,

      customer: {
        id: review.customer?.id,
        name: formatCustomerName(
          review.customer?.customerProfile
        ),
      },

      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return res.status(200).json({
      success: true,

      provider: {
        id: provider.id,
        name: provider.serviceProviderProfile
          ? `${provider.serviceProviderProfile.firstName} ${provider.serviceProviderProfile.lastName}`
          : null,
        serviceCategory:
          provider.serviceProviderProfile?.serviceCategory || null,
        profileImageUrl: provider.profileImageUrl,
      },

      summary: {
        averageRating,
        reviewCount,
        ratingBreakdown,
      },

      reviews: formattedReviews,
    });
  } catch (error) {
    next(error);
  }
};

// customer gets own reviews
const getMyReviews = async (req, res, next) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can view their reviews.",
      });
    }

    const reviews = await Review.findAll({
      where: {
        customerId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "serviceProvider",
          attributes: [
            "id",
            "email",
            "profileImageUrl",
          ],
          include: [
            {
              model: ServiceProviderProfile,
              as: "serviceProviderProfile",
              attributes: [
                "firstName",
                "lastName",
                "serviceCategory",
              ],
            },
          ],
        },
        {
          model: ReviewImage,
          as: "image",
          attributes: [
            "id",
            "imageUrl",
            "createdAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// get one review
const getReviewById = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id"],
          include: [
            {
              model: CustomerProfile,
              as: "customerProfile",
              attributes: [
                "firstName",
                "lastName",
              ],
            },
          ],
        },
        {
          model: User,
          as: "serviceProvider",
          attributes: [
            "id",
            "email",
            "profileImageUrl",
          ],
          include: [
            {
              model: ServiceProviderProfile,
              as: "serviceProviderProfile",
            },
          ],
        },
        {
          model: ReviewImage,
          as: "image",
          attributes: [
            "id",
            "imageUrl",
            "createdAt",
          ],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

// update customer review
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can update reviews.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review.",
      });
    }

    const {
      rating,
      likedTags,
      comment,
    } = req.body;

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5.",
        });
      }

      review.rating = numericRating;
    }

    if (likedTags !== undefined) {
      if (!validateTags(likedTags)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review tags.",
        });
      }

      review.likedTags = likedTags;
    }

    if (comment !== undefined) {
      const cleanComment =
        comment === null
          ? null
          : String(comment).trim();

      if (
        cleanComment &&
        cleanComment.length > MAX_COMMENT_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Comment cannot exceed 500 characters.",
        });
      }

      review.comment = cleanComment;
    }

    if (
      (!review.comment || !review.comment.trim()) &&
      (!review.likedTags ||
        review.likedTags.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one option or write a comment.",
      });
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// delete customer review
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can delete reviews.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review.",
      });
    }

    const reviewImage = await ReviewImage.findOne({
      where: {
        reviewId,
      },
    });

    if (reviewImage) {
      await deleteCloudinaryImage(
        reviewImage.publicId
      );

      await reviewImage.destroy();
    }

    await review.destroy();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// add one image
const addReviewImage = async (req, res, next) => {
  let uploadedImage = null;

  try {
    const { reviewId } = req.params;

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can add review images.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You can only add an image to your own review.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const existingImage = await ReviewImage.findOne({
      where: {
        reviewId,
      },
    });

    if (existingImage) {
      return res.status(409).json({
        success: false,
        message:
          "This review already has an image. Use the update image endpoint to replace it.",
      });
    }

    const result = await uploadImageToCloudinary(
      req.file,
      `home-service/reviews/${reviewId}`
    );

    uploadedImage = result.public_id;

    const image = await ReviewImage.create({
      reviewId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    return res.status(201).json({
      success: true,
      message: "Review image added successfully.",
      image: {
        id: image.id,
        imageUrl: image.imageUrl,
      },
    });
  } catch (error) {
    if (uploadedImage) {
      await deleteCloudinaryImage(uploadedImage);
    }

    next(error);
  }
};

// replace image
const updateReviewImage = async (req, res, next) => {
  let newPublicId = null;

  try {
    const { reviewId } = req.params;

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can update review images.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update an image on your own review.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const existingImage = await ReviewImage.findOne({
      where: {
        reviewId,
      },
    });

    if (!existingImage) {
      return res.status(404).json({
        success: false,
        message:
          "This review does not have an image. Use the add image endpoint.",
      });
    }

    const result = await uploadImageToCloudinary(
      req.file,
      `home-service/reviews/${reviewId}`
    );

    newPublicId = result.public_id;

    const oldPublicId = existingImage.publicId;

    existingImage.imageUrl = result.secure_url;
    existingImage.publicId = result.public_id;

    await existingImage.save();

    await deleteCloudinaryImage(oldPublicId);

    return res.status(200).json({
      success: true,
      message: "Review image updated successfully.",
      image: {
        id: existingImage.id,
        imageUrl: existingImage.imageUrl,
      },
    });
  } catch (error) {
    if (newPublicId) {
      await deleteCloudinaryImage(newPublicId);
    }

    next(error);
  }
};

// delete image
const deleteReviewImage = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can delete review images.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete an image from your own review.",
      });
    }

    const image = await ReviewImage.findOne({
      where: {
        reviewId,
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Review image not found.",
      });
    }

    const publicId = image.publicId;

    await image.destroy();

    await deleteCloudinaryImage(publicId);

    return res.status(200).json({
      success: true,
      message: "Review image deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// create provider reply
const createProviderReply = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { providerReply } = req.body;

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can reply to reviews.",
      });
    }

    if (
      !providerReply ||
      !providerReply.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Provider reply is required.",
      });
    }

    if (providerReply.trim().length > MAX_REPLY_LENGTH) {
      return res.status(400).json({
        success: false,
        message:
          "Provider reply cannot exceed 500 characters.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.serviceProviderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You can only reply to reviews received by you.",
      });
    }

    if (review.providerReply) {
      return res.status(409).json({
        success: false,
        message:
          "A reply already exists. Use the update reply endpoint.",
      });
    }

    const provider = await User.findByPk(req.user.id);

    if (
      !provider ||
      provider.accountStatus === "BANNED" ||
      provider.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not allowed to reply to reviews.",
      });
    }

    review.providerReply = providerReply.trim();
    review.providerRepliedAt = new Date();

    await review.save();

    return res.status(201).json({
      success: true,
      message: "Provider reply added successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// update provider reply
const updateProviderReply = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { providerReply } = req.body;

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can update replies.",
      });
    }

    if (
      !providerReply ||
      !providerReply.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Provider reply is required.",
      });
    }

    if (providerReply.trim().length > MAX_REPLY_LENGTH) {
      return res.status(400).json({
        success: false,
        message:
          "Provider reply cannot exceed 500 characters.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.serviceProviderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update replies on your reviews.",
      });
    }

    if (!review.providerReply) {
      return res.status(404).json({
        success: false,
        message: "Provider reply not found.",
      });
    }

    review.providerReply = providerReply.trim();
    review.providerRepliedAt = new Date();

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Provider reply updated successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// delete provider reply
const deleteProviderReply = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can delete replies.",
      });
    }

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.serviceProviderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete replies from your reviews.",
      });
    }

    if (!review.providerReply) {
      return res.status(404).json({
        success: false,
        message: "Provider reply not found.",
      });
    }

    review.providerReply = null;
    review.providerRepliedAt = null;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Provider reply deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// provider's own received reviews
const getMyReceivedReviews = async (req, res, next) => {
  try {
    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can view received reviews.",
      });
    }

    const reviews = await Review.findAll({
      where: {
        serviceProviderId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id"],
          include: [
            {
              model: CustomerProfile,
              as: "customerProfile",
              attributes: [
                "firstName",
                "lastName",
              ],
            },
          ],
        },
        {
          model: ReviewImage,
          as: "image",
          attributes: [
            "id",
            "imageUrl",
            "createdAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const reviewCount = reviews.length;

    const totalRating = reviews.reduce(
      (total, review) => total + review.rating,
      0
    );

    const averageRating =
      reviewCount > 0
        ? Number((totalRating / reviewCount).toFixed(1))
        : 0;

    const ratingBreakdown = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return res.status(200).json({
      success: true,

      summary: {
        averageRating,
        reviewCount,
        ratingBreakdown,
      },

      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// get all reviews from all service providers
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id"],
          include: [
            {
              model: CustomerProfile,
              as: "customerProfile",
              attributes: [
                "firstName",
                "lastName",
              ],
            },
          ],
        },

        {
          model: User,
          as: "serviceProvider",
          attributes: [
            "id",
            "profileImageUrl",
          ],
          include: [
            {
              model: ServiceProviderProfile,
              as: "serviceProviderProfile",
              attributes: [
                "firstName",
                "lastName",
                "serviceCategory",
              ],
            },
          ],
        },

        {
          model: ReviewImage,
          as: "image",
          attributes: [
            "id",
            "imageUrl",
          ],
        },
      ],

      order: [["created_at", "DESC"]],
    });

    const formattedReviews = reviews.map((review) => {
      const customerProfile =
        review.customer?.customerProfile;

      const providerProfile =
        review.serviceProvider?.serviceProviderProfile;

      return {
        id: review.id,

        rating: review.rating,

        likedTags: review.likedTags,

        comment: review.comment,

        image: review.image
          ? {
              id: review.image.id,
              imageUrl: review.image.imageUrl,
            }
          : null,

        providerReply: review.providerReply,

        providerRepliedAt:
          review.providerRepliedAt,

        customer: {
          id: review.customer?.id || null,

          name: customerProfile
            ? `${customerProfile.firstName} ${customerProfile.lastName}`
            : "Customer",
        },

        serviceProvider: {
          id: review.serviceProvider?.id || null,

          name: providerProfile
            ? `${providerProfile.firstName} ${providerProfile.lastName}`
            : "Service Provider",

          serviceCategory:
            providerProfile?.serviceCategory || null,

          profileImageUrl:
            review.serviceProvider
              ?.profileImageUrl || null,
        },

        createdAt: review.createdAt,

        updatedAt: review.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedReviews.length,
      reviews: formattedReviews,
    });
  } catch (error) {
    next(error);
  }
};

// get logged-in provider's rating summary
const getMyRating = async (req, res, next) => {
  try {
    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can view their rating.",
      });
    }

    const reviews = await Review.findAll({
      where: {
        serviceProviderId: req.user.id,
      },

      attributes: ["rating"],
    });

    const reviewCount = reviews.length;

    const totalRating = reviews.reduce(
      (total, review) => {
        return total + review.rating;
      },
      0
    );

    const averageRating =
      reviewCount > 0
        ? Number(
            (totalRating / reviewCount).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      averageRating,
      reviewCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getMyReviews,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,

  addReviewImage,
  updateReviewImage,
  deleteReviewImage,

  createProviderReply,
  updateProviderReply,
  deleteProviderReply,

  getMyReceivedReviews,
    getMyRating,
};