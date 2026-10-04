const Joi = require("joi");
const { OAuth2Client } = require("google-auth-library");

const sequelize = require("../config/database");

const bcrypt = require("bcryptjs");

const {
  User,
  CustomerProfile,
  ServiceProviderProfile,
  RefreshToken,
  InsurancePartnerProfile,
} = require("../models");

const {
  hashPassword,
  comparePassword,
} = require("../utils/password");
const {
  issueOtp,
  validateOtp,
} = require("../services/email-otp.service");

const {
  generateRefreshToken,
  hashToken,
} = require("../utils/token");

const {
  generateAccessToken,
} = require("../utils/jwt");

// Google browser testing
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/api/auth/google/callback"
);

// customer registration
const customerRegisterSchema = Joi.object({
  email: Joi.string().email().max(255).required(),

  password: Joi.string().min(8).max(72).required(),

  role: Joi.string().valid("CUSTOMER").required(),

  firstName: Joi.string().trim().min(2).max(100).required(),

  lastName: Joi.string().trim().min(2).max(100).required(),

  phoneNumber: Joi.string().trim().max(30).optional(),

  town: Joi.string().trim().max(150).optional(),

  homeAddress: Joi.string().trim().max(2000).optional(),
}).unknown(false);

// service provider registration
const providerRegisterSchema = Joi.object({
  email: Joi.string().email().max(255).required(),

  password: Joi.string().min(8).max(72).required(),

  role: Joi.string().valid("SERVICE_PROVIDER").required(),

  firstName: Joi.string().trim().min(2).max(100).required(),

  lastName: Joi.string().trim().min(2).max(100).required(),

  phoneNumber: Joi.string().trim().max(30).optional(),

  serviceLocation: Joi.string().trim().max(255).optional(),

  serviceCategory: Joi.string().trim().max(100).optional(),

  experienceYears: Joi.number().integer().min(0).max(100).optional(),

  hourlyRate: Joi.number().precision(2).min(0).max(1000000).optional(),

  description: Joi.string().trim().max(2000).optional(),
}).unknown(false);

// login
const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),

  password: Joi.string().required(),
}).unknown(false);

// customer Google registration
const customerGoogleSchema = Joi.object({
  idToken: Joi.string().min(20).required(),

  role: Joi.string().valid("CUSTOMER").required(),

  firstName: Joi.string().trim().min(2).max(100).required(),

  lastName: Joi.string().trim().min(2).max(100).required(),

  phoneNumber: Joi.string().trim().max(30).optional(),

  town: Joi.string().trim().max(150).optional(),

  homeAddress: Joi.string().trim().max(2000).optional(),
}).unknown(false);

// service provider Google registration
const providerGoogleSchema = Joi.object({
  idToken: Joi.string().min(20).required(),

  role: Joi.string().valid("SERVICE_PROVIDER").required(),

  firstName: Joi.string().trim().min(2).max(100).required(),

  lastName: Joi.string().trim().min(2).max(100).required(),

  phoneNumber: Joi.string().trim().max(30).optional(),

  serviceLocation: Joi.string().trim().max(255).optional(),

  serviceCategory: Joi.string().trim().max(100).optional(),

  experienceYears: Joi.number().integer().min(0).max(100).optional(),

  hourlyRate: Joi.number().precision(2).min(0).max(1000000).optional(),

  description: Joi.string().trim().max(2000).optional(),
}).unknown(false);

function validateRegister(body) {
  if (body.role === "CUSTOMER") {
    return customerRegisterSchema.validate(body, {
      abortEarly: false,
    });
  }

  if (body.role === "SERVICE_PROVIDER") {
    return providerRegisterSchema.validate(body, {
      abortEarly: false,
    });
  }

  return {
    error: {
      details: [
        {
          message: '"role" must be CUSTOMER or SERVICE_PROVIDER',
        },
      ],
    },
  };
}

function validateGoogleRegister(body) {
  if (body.role === "CUSTOMER") {
    return customerGoogleSchema.validate(body, {
      abortEarly: false,
    });
  }

  if (body.role === "SERVICE_PROVIDER") {
    return providerGoogleSchema.validate(body, {
      abortEarly: false,
    });
  }

  return {
    error: {
      details: [
        {
          message: '"role" must be CUSTOMER or SERVICE_PROVIDER',
        },
      ],
    },
  };
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    profileImageUrl: user.profileImageUrl,
    profileImageSource: user.profileImageSource,
    googleProfileImageUrl: user.googleProfileImageUrl,
    createdAt: user.createdAt,
  };
}

async function createSession(user, transaction) {
  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken();

  const tokenHash = hashToken(refreshToken);

  const days = Number(process.env.REFRESH_TOKEN_DAYS) || 30;

  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + days);

  await RefreshToken.create(
    {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
    {
      transaction,
    }
  );

  return {
    accessToken,
    refreshToken,
  };
}

// register
async function register(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { error, value } = validateRegister(req.body);

    if (error) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: error.details.map((item) => item.message),
      });
    }

    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      town,
      homeAddress,
      serviceLocation,
      serviceCategory,
      experienceYears,
      hourlyRate,
      description,
    } = value;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.unscoped().findOne({
      where: {
        email: normalizedEmail,
      },
      transaction,
    });

    const passwordHash = await hashPassword(password);
    let user;

    if (existingUser) {
      if (existingUser.isVerified) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: "A verified account with this email already exists. Please log in.",
        });
      }

      if (
        existingUser.authProvider !== "LOCAL" ||
        existingUser.role !== role ||
        !["CUSTOMER", "SERVICE_PROVIDER"].includes(existingUser.role)
      ) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: "This email is already registered with a different sign-in method or role.",
        });
      }

      user = existingUser;
      await user.update(
        {
          passwordHash,
          isActive: true,
          accountStatus: "REGISTERED",
        },
        { transaction }
      );
    } else {
      user = await User.create(
        {
          email: normalizedEmail,
          passwordHash,
          authProvider: "LOCAL",
          role,
          isVerified: false,
          isActive: true,
          profileImageSource: "NONE",
        },
        { transaction }
      );
    }

    // customer profile
    if (role === "CUSTOMER") {
      const customerValues = {
          userId: user.id,
          firstName,
          lastName,
          phoneNumber,
          town,
          homeAddress,
      };
      const customerProfile = await CustomerProfile.findOne({
        where: { userId: user.id },
        transaction,
      });
      if (customerProfile) {
        await customerProfile.update(customerValues, { transaction });
      } else {
        await CustomerProfile.create(customerValues, { transaction });
      }
    }

    // service provider profile
    if (role === "SERVICE_PROVIDER") {
      const providerValues = {
          userId: user.id,
          firstName,
          lastName,
          phoneNumber,
          serviceLocation,
          serviceCategory,
          experienceYears,
          hourlyRate,
          description,
          verificationStatus: "REGISTERED",
      };
      const providerProfile = await ServiceProviderProfile.findOne({
        where: { userId: user.id },
        transaction,
      });
      if (providerProfile) {
        await providerProfile.update(providerValues, { transaction });
      } else {
        await ServiceProviderProfile.create(providerValues, { transaction });
      }
    }

    await issueOtp(
      user,
      "EMAIL_VERIFICATION",
      transaction,
      true
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: existingUser
        ? "Registration updated. A new verification code was sent."
        : "Account created. Check your email for the verification code.",
      data: {
        email: user.email,
        role: user.role,
        requiresVerification: true,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
}