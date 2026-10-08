// const express = require("express");

// const authenticate = require("../middleware/auth.middleware");
// const upload = require("../middleware/upload.middleware");

// const {
//   createInsuranceClaim,
//   getMyInsuranceClaims,
//   getInsuranceClaimById,
//   updateInsuranceClaim,
//   deleteInsuranceClaim,

//   getPartnerInsuranceClaims,
//   getPartnerInsuranceClaimById,
//   approveInsuranceClaim,
//   rejectInsuranceClaim,
// } = require("../controllers/insurance-claim.controller");

// const router = express.Router();

// // service provider
// router.post(
//   "/",
//   authenticate,
//   upload.array("images", 3),
//   createInsuranceClaim
// );

// router.get(
//   "/my",
//   authenticate,
//   getMyInsuranceClaims
// );

// router.get(
//   "/:claimId",
//   authenticate,
//   getInsuranceClaimById
// );

// router.put(
//   "/:claimId",
//   authenticate,
//   upload.array("images", 3),
//   updateInsuranceClaim
// );

// router.delete(
//   "/:claimId",
//   authenticate,
//   deleteInsuranceClaim
// );

// // insurance partner
// router.get(
//   "/partner/all",
//   authenticate,
//   getPartnerInsuranceClaims
// );

// router.get(
//   "/partner/:claimId",
//   authenticate,
//   getPartnerInsuranceClaimById
// );

// router.put(
//   "/partner/:claimId/approve",
//   authenticate,
//   approveInsuranceClaim
// );

// router.put(
//   "/partner/:claimId/reject",
//   authenticate,
//   rejectInsuranceClaim
// );

// module.exports = router;



const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  createInsuranceClaim,
  getMyInsuranceClaims,
  getInsuranceClaimById,
  updateInsuranceClaim,
  deleteInsuranceClaim,
  getPartnerInsuranceClaims,
  getPartnerInsuranceClaimById,
  approveInsuranceClaim,
  rejectInsuranceClaim,
} = require("../controllers/insurance-claim.controller");

const router = express.Router();

// service provider creates claim
router.post(
  "/",
  authenticate,
  upload.array("images", 3),
  createInsuranceClaim
);

// insurance partner
router.get(
  "/partner/all",
  authenticate,
  getPartnerInsuranceClaims
);

router.get(
  "/partner/:claimId",
  authenticate,
  getPartnerInsuranceClaimById
);

router.put(
  "/partner/:claimId/approve",
  authenticate,
  approveInsuranceClaim
);

router.put(
  "/partner/:claimId/reject",
  authenticate,
  rejectInsuranceClaim
);

// service provider / customer
router.get(
  "/my",
  authenticate,
  getMyInsuranceClaims
);

router.get(
  "/:claimId",
  authenticate,
  getInsuranceClaimById
);

router.patch(
  "/:claimId",
  authenticate,
  upload.array("images", 3),
  updateInsuranceClaim
);

router.delete(
  "/:claimId",
  authenticate,
  deleteInsuranceClaim
);

module.exports = router;