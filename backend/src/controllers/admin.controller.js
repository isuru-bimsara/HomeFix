const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const {
  User, CustomerProfile, ServiceProviderProfile, InsurancePartnerProfile,
  Booking, Review, InsuranceClaim,
} = require("../models");

const ALLOWED_ROLES = ["CUSTOMER", "SERVICE_PROVIDER", "ADMIN", "CUSTOMER_SERVICE", "INSURANCE_PARTNER"];
const USER_ATTRIBUTES = ["id", "email", "role", "accountStatus", "isVerified", "isActive", "profileImageUrl", "created_at", "updated_at"];
const USER_INCLUDES = [
  { model: CustomerProfile, as: "customerProfile", attributes: ["firstName", "lastName", "phoneNumber", "town", "homeAddress"] },
  { model: ServiceProviderProfile, as: "serviceProviderProfile", attributes: ["firstName", "lastName", "phoneNumber", "serviceCategory", "serviceLocation", "experienceYears", "hourlyRate", "verificationStatus"] },
  { model: InsurancePartnerProfile, as: "insurancePartnerProfile", attributes: ["partnerId", "partnerName", "companyName", "coverageRegion", "supportHours", "businessEmail", "phoneNumber", "claimsTeam"] },
];

function adminJson(row) {
  const value = row && typeof row.toJSON === "function" ? row.toJSON() : row;
  if (value && value.created_at !== undefined) {
    value.createdAt = value.created_at;
    delete value.created_at;
  }
  if (value && value.updated_at !== undefined) {
    value.updatedAt = value.updated_at;
    delete value.updated_at;
  }
  return value;
}

async function findUsers(role) {
  const rows = await User.unscoped().findAll({
    where: role ? { role } : undefined,
    attributes: USER_ATTRIBUTES,
    include: USER_INCLUDES,
    order: [["created_at", "DESC"]],
  });
  return rows.map(adminJson);
}

async function findBookings() {
  return (await Booking.findAll({ order: [["created_at", "DESC"]] })).map(adminJson);
}

async function findReviews() {
  return (await Review.findAll({ order: [["createdAt", "DESC"]] })).map(adminJson);
}

async function findClaims() {
  return (await InsuranceClaim.findAll({ order: [["created_at", "DESC"]] })).map(adminJson);
}

function generatePartnerId() {
  return `INS-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function createAccount(req, res, next, forcedRole) {
  const transaction = await sequelize.transaction();
  try {
    const { email, password } = req.body;
    const role = forcedRole || req.body.role;

    if (!email || !String(email).trim()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!password || String(password).length < 8) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Password must contain at least 8 characters." });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Invalid user role." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.unscoped().findOne({ where: { email: normalizedEmail }, transaction });
    if (existing) {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }

    const user = await User.create({
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(String(password), 12),
      authProvider: "LOCAL",
      role,
      accountStatus: "REGISTERED",
      isVerified: true,
      isActive: true,
      profileImageSource: "NONE",
    }, { transaction });

    let partnerProfile = null;
    if (role === "INSURANCE_PARTNER") {
      let partnerId;
      let exists;
      do {
        partnerId = generatePartnerId();
        exists = await InsurancePartnerProfile.findOne({ where: { partnerId }, transaction });
      } while (exists);

      partnerProfile = await InsurancePartnerProfile.create({
        userId: user.id,
        partnerId,
        partnerName: req.body.partnerName || null,
        companyName: req.body.companyName || null,
        coverageRegion: req.body.coverageRegion || null,
        supportHours: req.body.supportHours || null,
        businessEmail: req.body.businessEmail || null,
        phoneNumber: req.body.phoneNumber || null,
        claimsTeam: req.body.claimsTeam || null,
      }, { transaction });
    }

    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      data: {
        id: user.id, email: user.email, role: user.role,
        accountStatus: user.accountStatus, isVerified: user.isVerified, isActive: user.isActive,
        ...(partnerProfile && { partnerProfile: { id: partnerProfile.id, partnerId: partnerProfile.partnerId } }),
      },
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    next(error);
  }
}