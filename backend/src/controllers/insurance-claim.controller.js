const {
  InsuranceClaim,
  InsuranceClaimImage,
  User,
  ServiceProviderProfile,
  InsurancePartnerProfile,
} = require("../models");

const {
  uploadImageToCloudinary,
  deleteCloudinaryImage,
} = require("../utils/cloudinary-upload");

const MAX_IMAGES = 3;
const MAX_DESCRIPTION_LENGTH = 2000;
const { notifyUser, notifyUsers } = require("../services/notification.service");

// validation
function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function validateClaimData(data) {
  const {
    incidentDate,
    incidentTime,
    damageType,
    damageAmount,
    incidentLocation,
    description,
  } = data;

  if (!incidentDate) {
    return "Incident date is required.";
  }

  if (!incidentTime) {
    return "Incident time is required.";
  }

  if (!damageType || !String(damageType).trim()) {
    return "Damage type is required.";
  }

  if (
    damageAmount === undefined ||
    damageAmount === null ||
    damageAmount === ""
  ) {
    return "Damage amount is required.";
  }

  const amount = Number(damageAmount);

  if (!Number.isFinite(amount) || amount < 0) {
    return "Damage amount must be a valid positive number.";
  }

  if (!incidentLocation || !String(incidentLocation).trim()) {
    return "Incident location is required.";
  }

  if (!description || !String(description).trim()) {
    return "Please describe what happened.";
  }

  if (String(description).trim().length > MAX_DESCRIPTION_LENGTH) {
    return `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  return null;
}

async function safeRollback(transaction) {
  try {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
  } catch (rollbackError) {
    console.error(
      "Insurance claim rollback error:",
      rollbackError.message
    );
  }
}

// create claim
const createInsuranceClaim = async (req, res, next) => {
  const transaction = await InsuranceClaim.sequelize.transaction();
  const uploadedImages = [];

  try {
    if (req.user.role !== "SERVICE_PROVIDER") {
      await safeRollback(transaction);

      return res.status(403).json({
        success: false,
        message:
          "Only service providers can create insurance claims.",
      });
    }

    const provider = await User.findByPk(req.user.id);

    if (
      !provider ||
      provider.role !== "SERVICE_PROVIDER" ||
      provider.accountStatus === "BANNED" ||
      provider.isActive === false
    ) {
      await safeRollback(transaction);

      return res.status(403).json({
        success: false,
        message:
          "Your account is not allowed to create insurance claims.",
      });
    }

    const {
      incidentDate,
      incidentTime,
      damageType,
      damageAmount,
      incidentLocation,
      description,
    } = req.body;

    const validationError = validateClaimData(req.body);

    if (validationError) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (!req.files || req.files.length === 0) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message: "Please upload at least one damage image.",
      });
    }

    if (req.files.length > MAX_IMAGES) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message: "Maximum 3 images are allowed.",
      });
    }

    const numericDamageAmount = Number(damageAmount);

    const claim = await InsuranceClaim.create(
      {
        serviceProviderId: req.user.id,
        incidentDate,
        incidentTime,
        damageType: String(damageType).trim(),
        damageAmount: numericDamageAmount,
        incidentLocation: String(incidentLocation).trim(),
        description: String(description).trim(),
        status: "PENDING",
      },
      {
        transaction,
      }
    );

    for (const file of req.files) {
      const result = await uploadImageToCloudinary(
        file,
        `home-service/insurance-claims/${claim.id}`
      );

      uploadedImages.push(result.public_id);

      await InsuranceClaimImage.create(
        {
          claimId: claim.id,
          imageUrl: result.secure_url,
          publicId: result.public_id,
        },
        {
          transaction,
        }
      );
    }

    await transaction.commit();

    const createdClaim = await InsuranceClaim.findByPk(
      claim.id,
      {
        include: [
          {
            model: InsuranceClaimImage,
            as: "images",
            attributes: [
              "id",
              "imageUrl",
              "publicId",
              "createdAt",
            ],
          },
        ],
      }
    );
    const partners = await User.findAll({ where: { role: "INSURANCE_PARTNER", isActive: true }, attributes: ["id"] });
    await notifyUsers(partners.map((item) => item.id), { type: "CLAIM_CREATED", title: "New insurance claim", body: "A service provider submitted a new damage claim.", entityType: "CLAIM", entityId: claim.id, data: { claimId: claim.id } });

    return res.status(201).json({
      success: true,
      message: "Insurance claim created successfully.",
      claim: createdClaim,
    });
  } catch (error) {
    await safeRollback(transaction);

    for (const publicId of uploadedImages) {
      await deleteCloudinaryImage(publicId);
    }

    next(error);
  }
};

// get provider claims
const getMyInsuranceClaims = async (req, res, next) => {
  try {
    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can view their insurance claims.",
      });
    }

    const claims = await InsuranceClaim.findAll({
      where: {
        serviceProviderId: req.user.id,
      },
      include: [
        {
          model: InsuranceClaimImage,
          as: "images",
          attributes: [
            "id",
            "imageUrl",
            "publicId",
            "createdAt",
          ],
        },
        {
          model: User,
          as: "reviewedByPartner",
          attributes: ["id", "email", "profileImageUrl"],
          include: [{
            model: InsurancePartnerProfile,
            as: "insurancePartnerProfile",
            attributes: ["partnerId", "partnerName", "companyName"],
          }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

// get one provider claim
const getInsuranceClaimById = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    if (!isValidUUID(claimId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can view this claim.",
      });
    }

    const claim = await InsuranceClaim.findOne({
      where: {
        id: claimId,
        serviceProviderId: req.user.id,
      },
      include: [
        {
          model: InsuranceClaimImage,
          as: "images",
          attributes: [
            "id",
            "imageUrl",
            "publicId",
            "createdAt",
          ],
        },
        {
          model: User,
          as: "reviewedByPartner",
          attributes: ["id", "email", "profileImageUrl"],
          include: [{
            model: InsurancePartnerProfile,
            as: "insurancePartnerProfile",
            attributes: ["partnerId", "partnerName", "companyName"],
          }],
        },
      ],
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Insurance claim not found.",
      });
    }

    return res.status(200).json({
      success: true,
      claim,
    });
  } catch (error) {
    next(error);
  }
};

// update provider claim
// update provider claim
const updateInsuranceClaim = async (req, res, next) => {
  const transaction =
    await InsuranceClaim.sequelize.transaction();

  const uploadedImages = [];
  const oldCloudinaryImages = [];

  try {
    const { claimId } = req.params;

    if (!isValidUUID(claimId)) {
      await safeRollback(transaction);

      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (req.user.role !== "SERVICE_PROVIDER") {
      await safeRollback(transaction);

      return res.status(403).json({
        success: false,
        message:
          "Only service providers can update claims.",
      });
    }

    const claim = await InsuranceClaim.findOne({
      where: {
        id: claimId,
        serviceProviderId: req.user.id,
      },
      transaction,
    });

    if (!claim) {
      await safeRollback(transaction);

      return res.status(404).json({
        success: false,
        message: "Insurance claim not found.",
      });
    }

    if (claim.status !== "PENDING") {
      await safeRollback(transaction);

      return res.status(409).json({
        success: false,
        message:
          "This claim cannot be edited after it has been submitted for review.",
      });
    }

    const {
      incidentDate,
      incidentTime,
      damageType,
      damageAmount,
      incidentLocation,
      description,
    } = req.body;

    // incident date
    if (incidentDate !== undefined) {
      const value = String(incidentDate).trim();

      if (!value) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message: "Incident date cannot be empty.",
        });
      }

      claim.incidentDate = value;
    }

    // incident time
    if (incidentTime !== undefined) {
      const value = String(incidentTime).trim();

      if (!value) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message: "Incident time cannot be empty.",
        });
      }

      claim.incidentTime = value;
    }

    // damage type
    if (damageType !== undefined) {
      const value = String(damageType).trim();

      if (!value) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message: "Damage type cannot be empty.",
        });
      }

      claim.damageType = value;
    }

    // damage amount
    if (damageAmount !== undefined) {
      const amount = Number(damageAmount);

      if (!Number.isFinite(amount) || amount < 0) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message:
            "Damage amount must be a valid positive number.",
        });
      }

      claim.damageAmount = amount;
    }

    // incident location
    if (incidentLocation !== undefined) {
      const value = String(incidentLocation).trim();

      if (!value) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message:
            "Incident location cannot be empty.",
        });
      }

      claim.incidentLocation = value;
    }

    // description
    if (description !== undefined) {
      const value = String(description).trim();

      if (!value) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message: "Description cannot be empty.",
        });
      }

      if (value.length > MAX_DESCRIPTION_LENGTH) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message:
            "Description cannot exceed 2000 characters.",
        });
      }

      claim.description = value;
    }

    // save only the fields that were provided
    await claim.save({
      transaction,
    });

    // update images only when images are provided
    if (req.files && req.files.length > 0) {
      if (req.files.length > MAX_IMAGES) {
        await safeRollback(transaction);

        return res.status(400).json({
          success: false,
          message: "Maximum 3 images are allowed.",
        });
      }

      // get existing images
      const oldImages =
        await InsuranceClaimImage.findAll({
          where: {
            claimId: claim.id,
          },
          transaction,
        });

      // remember old Cloudinary images
      for (const oldImage of oldImages) {
        oldCloudinaryImages.push(
          oldImage.publicId
        );
      }

      // remove old database images
      await InsuranceClaimImage.destroy({
        where: {
          claimId: claim.id,
        },
        transaction,
      });

      // upload new images
      for (const file of req.files) {
        const result =
          await uploadImageToCloudinary(
            file,
            `home-service/insurance-claims/${claim.id}`
          );

        uploadedImages.push(result.public_id);

        await InsuranceClaimImage.create(
          {
            claimId: claim.id,
            imageUrl: result.secure_url,
            publicId: result.public_id,
          },
          {
            transaction,
          }
        );
      }
    }

    await transaction.commit();

    // delete old Cloudinary images after DB commit
    for (const publicId of oldCloudinaryImages) {
      await deleteCloudinaryImage(publicId);
    }

    const updatedClaim =
      await InsuranceClaim.findByPk(claim.id, {
        include: [
          {
            model: InsuranceClaimImage,
            as: "images",
            attributes: [
              "id",
              "imageUrl",
              "publicId",
              "createdAt",
            ],
          },
        ],
      });

    return res.status(200).json({
      success: true,
      message:
        "Insurance claim updated successfully.",
      claim: updatedClaim,
    });
  } catch (error) {
    await safeRollback(transaction);

    // delete newly uploaded images if transaction failed
    for (const publicId of uploadedImages) {
      await deleteCloudinaryImage(publicId);
    }

    next(error);
  }
};

// delete provider claim
const deleteInsuranceClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    if (!isValidUUID(claimId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message:
          "Only service providers can delete claims.",
      });
    }

    const claim = await InsuranceClaim.findOne({
      where: {
        id: claimId,
        serviceProviderId: req.user.id,
      },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Insurance claim not found.",
      });
    }

    if (claim.status !== "PENDING") {
      return res.status(409).json({
        success: false,
        message:
          "This claim cannot be deleted after review has started.",
      });
    }

    const images =
      await InsuranceClaimImage.findAll({
        where: {
          claimId: claim.id,
        },
      });

    await InsuranceClaimImage.destroy({
      where: {
        claimId: claim.id,
      },
    });

    await claim.destroy();

    for (const image of images) {
      await deleteCloudinaryImage(image.publicId);
    }

    return res.status(200).json({
      success: true,
      message:
        "Insurance claim deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// partner gets all claims
const getPartnerInsuranceClaims = async (
  req,
  res,
  next
) => {
  try {
    if (req.user.role !== "INSURANCE_PARTNER") {
      return res.status(403).json({
        success: false,
        message:
          "Only insurance partners can view insurance claims.",
      });
    }

    const claims = await InsuranceClaim.findAll({
      include: [
        {
          model: InsuranceClaimImage,
          as: "images",
          attributes: [
            "id",
            "imageUrl",
            "publicId",
            "createdAt",
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
              attributes: [
                "firstName",
                "lastName",
                "phoneNumber",
                "serviceCategory",
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

// partner gets one claim
const getPartnerInsuranceClaimById = async (
  req,
  res,
  next
) => {
  try {
    const { claimId } = req.params;

    if (!isValidUUID(claimId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (req.user.role !== "INSURANCE_PARTNER") {
      return res.status(403).json({
        success: false,
        message:
          "Only insurance partners can view insurance claims.",
      });
    }

    const claim =
      await InsuranceClaim.findByPk(
        claimId,
        {
          include: [
            {
              model: InsuranceClaimImage,
              as: "images",
              attributes: [
                "id",
                "imageUrl",
                "publicId",
                "createdAt",
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
                  attributes: [
                    "firstName",
                    "lastName",
                    "phoneNumber",
                    "serviceCategory",
                  ],
                },
              ],
            },
            {
              model: User,
              as: "reviewedByPartner",
              attributes: ["id", "email", "profileImageUrl"],
              include: [{
                model: InsurancePartnerProfile,
                as: "insurancePartnerProfile",
                attributes: ["partnerId", "partnerName", "companyName"],
              }],
            },
          ],
        }
      );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Insurance claim not found.",
      });
    }

    return res.status(200).json({
      success: true,
      claim,
    });
  } catch (error) {
    next(error);
  }
};

// partner approves claim
const approveInsuranceClaim = async (
  req,
  res,
  next
) => {
  try {
    const { claimId } = req.params;

    if (!isValidUUID(claimId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (req.user.role !== "INSURANCE_PARTNER") {
      return res.status(403).json({
        success: false,
        message:
          "Only insurance partners can approve claims.",
      });
    }

    const claim =
      await InsuranceClaim.findByPk(claimId);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Insurance claim not found.",
      });
    }

    if (claim.status !== "PENDING") {
      return res.status(409).json({
        success: false,
        message:
          "Only pending claims can be approved.",
      });
    }

    claim.status = "APPROVED";
    claim.reviewedByPartnerId = req.user.id;
    claim.reviewedAt = new Date();

    await claim.save();

    await notifyUser(claim.serviceProviderId, { type: "CLAIM_APPROVED", title: "Claim approved", body: "Your insurance claim has been approved.", entityType: "CLAIM", entityId: claim.id, data: { claimId: claim.id } });

    return res.status(200).json({
      success: true,
      message:
        "Insurance claim approved successfully.",
      claim,
    });
  } catch (error) {
    next(error);
  }
};

// partner rejects claim
const rejectInsuranceClaim = async (
  req,
  res,
  next
) => {
  try {
    const { claimId } = req.params;

    if (!isValidUUID(claimId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (req.user.role !== "INSURANCE_PARTNER") {
      return res.status(403).json({
        success: false,
        message:
          "Only insurance partners can reject claims.",
      });
    }

    const claim =
      await InsuranceClaim.findByPk(claimId);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Insurance claim not found.",
      });
    }

    if (claim.status !== "PENDING") {
      return res.status(409).json({
        success: false,
        message:
          "Only pending claims can be rejected.",
      });
    }

    claim.status = "REJECTED";
    claim.reviewedByPartnerId = req.user.id;
    claim.reviewedAt = new Date();

    await claim.save();

    await notifyUser(claim.serviceProviderId, { type: "CLAIM_REJECTED", title: "Claim rejected", body: "Your insurance claim was rejected.", entityType: "CLAIM", entityId: claim.id, data: { claimId: claim.id } });

    return res.status(200).json({
      success: true,
      message:
        "Insurance claim rejected successfully.",
      claim,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInsuranceClaim,
  getMyInsuranceClaims,
  getInsuranceClaimById,
  updateInsuranceClaim,
  deleteInsuranceClaim,

  getPartnerInsuranceClaims,
  getPartnerInsuranceClaimById,
  approveInsuranceClaim,
  rejectInsuranceClaim,
};
