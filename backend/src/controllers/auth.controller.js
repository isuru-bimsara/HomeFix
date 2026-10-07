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

// login
async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: error.details.map((item) => item.message),
      });
    }

    const email = value.email.trim().toLowerCase();

    const user = await User.unscoped().findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message:
          "This account does not use password login. Please use Google login.",
      });
    }

    const passwordValid = await comparePassword(
      value.password,
      user.passwordHash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Verify your email before logging in.",
        data: {
          email: user.email,
          role: user.role,
          requiresVerification: true,
        },
      });
    }

    const session = await createSession(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: publicUser(user),
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Google login/register
async function googleLogin(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const idToken = String(req.body.idToken || "").trim();

    if (!idToken) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Google ID token is required.",
      });
    }

    const clientIds = process.env.GOOGLE_CLIENT_IDS
      ? process.env.GOOGLE_CLIENT_IDS
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    if (clientIds.length === 0) {
      await transaction.rollback();

      return res.status(500).json({
        success: false,
        message: "Google authentication is not configured.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientIds,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Invalid Google token.",
      });
    }

    const googleId = payload.sub;

    const email = payload.email?.trim().toLowerCase();

    const emailVerified = payload.email_verified;

    const googlePicture = payload.picture || null;

    if (!googleId || !email || !emailVerified) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Google account verification failed.",
      });
    }

    // find by Google ID
    let user = await User.unscoped().findOne({
      where: {
        googleId,
      },
      transaction,
    });

    // find by email
    if (!user) {
      user = await User.unscoped().findOne({
        where: {
          email,
        },
        transaction,
      });
    }

    // Existing Google accounts log in immediately. Registration details are
    // only required the first time this Google account is used.
    if (!user && !req.body.role) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        code: "GOOGLE_REGISTRATION_REQUIRED",
        message: "Choose a role and complete your profile to continue.",
        data: {
          email,
          firstName: payload.given_name || "",
          lastName: payload.family_name || "",
        },
      });
    }

    let registrationValue = req.body;
    if (!user) {
      const { error, value } = validateGoogleRegister(req.body);
      if (error) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: error.details.map((item) => item.message),
        });
      }
      registrationValue = value;
    }

    const {
      role: requestedRole,
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
    } = registrationValue;

    // existing user
    if (user) {
      if (requestedRole && user.role !== requestedRole) {
        await transaction.rollback();

        return res.status(409).json({
          success: false,
          message: `This Google account is registered as ${user.role}. You cannot login using ${requestedRole}.`,
          code: "ROLE_MISMATCH",
        });
      }

      if (user.googleId && user.googleId !== googleId) {
        await transaction.rollback();

        return res.status(409).json({
          success: false,
          message:
            "This email is already linked to another Google account.",
        });
      }

      if (!user.googleId && user.authProvider === "LOCAL") {
        await transaction.rollback();

        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists. Please login with your password first.",
          code: "LOCAL_ACCOUNT_EXISTS",
        });
      }

      user.googleId = googleId;
      user.googleProfileImageUrl = googlePicture;
      user.isVerified = true;

      if (user.profileImageSource !== "CUSTOM") {
        user.profileImageUrl = googlePicture;
        user.profileImageSource = googlePicture
          ? "GOOGLE"
          : "NONE";
      }

      await user.save({
        transaction,
      });
    }

    // new Google user
    else {
      const newUser = await User.create(
        {
          email,
          googleId,
          authProvider: "GOOGLE",
          role: requestedRole,
          isVerified: true,
          isActive: true,
          profileImageUrl: googlePicture,
          googleProfileImageUrl: googlePicture,
          profileImageSource: googlePicture
            ? "GOOGLE"
            : "NONE",
        },
        {
          transaction,
        }
      );

      user = newUser;

      // customer Google profile
      if (requestedRole === "CUSTOMER") {
        await CustomerProfile.create(
          {
            userId: user.id,
            firstName,
            lastName,
            phoneNumber,
            town,
            homeAddress,
          },
          {
            transaction,
          }
        );
      }

      // service provider Google profile
      if (requestedRole === "SERVICE_PROVIDER") {
        await ServiceProviderProfile.create(
          {
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
          },
          {
            transaction,
          }
        );
      }
    }

    if (!user.isActive) {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    const session = await createSession(user, transaction);

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      data: {
        user: publicUser(user),
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function verifyEmailOtp(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    if (!email || !/^\d{6}$/.test(otp)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Enter a valid email and 6-digit code." });
    }

    const user = await User.unscoped().findOne({ where: { email }, transaction });
    if (!user || !["CUSTOMER", "SERVICE_PROVIDER"].includes(user.role)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Unable to verify this account." });
    }

    if (!user.isVerified) {
      await validateOtp(user.id, "EMAIL_VERIFICATION", otp, transaction);
      user.isVerified = true;
      await user.save({ transaction });
    }

    const session = await createSession(user, transaction);
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: {
        user: publicUser(user),
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      },
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    next(error);
  }
}

async function resendEmailOtp(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.unscoped().findOne({ where: { email } });
    if (!user || !["CUSTOMER", "SERVICE_PROVIDER"].includes(user.role)) {
      return res.status(400).json({ success: false, message: "Unable to verify this account." });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "This email is already verified." });
    }
    await issueOtp(user, "EMAIL_VERIFICATION");
    return res.status(200).json({ success: true, message: "A new verification code was sent." });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.unscoped().findOne({ where: { email } });
    if (!user || !["CUSTOMER", "SERVICE_PROVIDER"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Password reset is available only for customer and service-provider accounts.",
      });
    }
    if (!user.isVerified || !user.isActive || user.authProvider !== "LOCAL") {
      return res.status(400).json({ success: false, message: "This account cannot use password reset." });
    }
    await issueOtp(user, "PASSWORD_RESET");
    return res.status(200).json({
      success: true,
      message: "A password reset code was sent to your email.",
      data: { email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");
    if (!/^\d{6}$/.test(otp) || newPassword.length < 8 || newPassword.length > 72) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit code and a password of at least 8 characters.",
      });
    }

    const user = await User.unscoped().findOne({ where: { email }, transaction });
    if (!user || !["CUSTOMER", "SERVICE_PROVIDER"].includes(user.role)) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: "This account cannot use password reset." });
    }

    await validateOtp(user.id, "PASSWORD_RESET", otp, transaction);
    user.passwordHash = await hashPassword(newPassword);
    await user.save({ transaction });
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: user.id, revokedAt: null }, transaction }
    );
    await transaction.commit();
    return res.status(200).json({ success: true, message: "Password changed successfully. You can now log in." });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (newPassword.length < 8 || newPassword.length > 72) {
      return res.status(400).json({ success: false, message: "New password must contain 8 to 72 characters." });
    }
    const user = await User.unscoped().findByPk(req.user.id);
    if (!user || user.authProvider !== "LOCAL" || !user.passwordHash) {
      return res.status(400).json({ success: false, message: "This account does not use password login." });
    }
    if (!(await comparePassword(currentPassword, user.passwordHash))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
    if (await comparePassword(newPassword, user.passwordHash)) {
      return res.status(400).json({ success: false, message: "New password must be different from the current password." });
    }
    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: user.id, revokedAt: null } }
    );
    return res.status(200).json({ success: true, message: "Password changed successfully. Please log in again." });
  } catch (error) {
    next(error);
  }
}

// refresh token
const refreshToken = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { refreshToken: rawRefreshToken } = req.body;

    if (!rawRefreshToken) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const tokenHash = hashToken(rawRefreshToken);

    // Lock only the refresh token row
    const storedToken = await RefreshToken.findOne({
      where: {
        tokenHash,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!storedToken) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    // Reuse detection
    if (storedToken.revokedAt) {
      await RefreshToken.update(
        {
          revokedAt: new Date(),
        },
        {
          where: {
            userId: storedToken.userId,
            revokedAt: null,
          },
          transaction,
        }
      );

      await transaction.commit();

      return res.status(401).json({
        success: false,
        message: "Refresh token reuse detected. Please login again.",
      });
    }

    // Check expiration
    if (new Date(storedToken.expiresAt) <= new Date()) {
      await storedToken.update(
        {
          revokedAt: new Date(),
        },
        {
          transaction,
        }
      );

      await transaction.commit();

      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
      });
    }

    // Get user separately
    const user = await User.findByPk(storedToken.userId, {
      transaction,
    });

    if (!user) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (!user.isActive) {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message: "User account is inactive.",
      });
    }

    // Create new access token
    const newAccessToken = generateAccessToken(user);

    // Create new refresh token
    const newRefreshToken = generateRefreshToken();

    const newTokenHash = hashToken(newRefreshToken);

    const newExpiresAt = new Date(
      Date.now() +
        Number(process.env.REFRESH_TOKEN_DAYS || 30) *
          24 *
          60 *
          60 *
          1000
    );

    const newStoredToken = await RefreshToken.create(
      {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      },
      {
        transaction,
      }
    );

    // Revoke old token and link it to new token
    await storedToken.update(
      {
        revokedAt: new Date(),
        replacedByTokenId: newStoredToken.id,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// logout
async function logout(req, res, next) {
  try {
    const inputToken = req.body.refreshToken;

    if (inputToken) {
      const tokenHash = hashToken(inputToken);

      await RefreshToken.update(
        {
          revokedAt: new Date(),
        },
        {
          where: {
            tokenHash,
            revokedAt: null,
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// temporary Google testing
async function googleTestLogin(req, res, next) {
  try {
    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
      redirect_uri:
        "http://localhost:5000/api/auth/google/callback",
    });

    return res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
}

async function googleTestCallback(req, res, next) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Google authorization code is missing.",
      });
    }

    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      return res.status(400).json({
        success: false,
        message: "Google did not return an ID token.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return res.json({
      success: true,
      message: "Google ID token generated successfully.",
      data: {
        idToken: tokens.id_token,
        googleUser: {
          googleId: payload.sub,
          email: payload.email,
          emailVerified: payload.email_verified,
          firstName: payload.given_name,
          lastName: payload.family_name,
          picture: payload.picture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getMyInsurancePartnerProfile(
  req,
  res,
  next
) {
  try {
    if (req.user.role !== "INSURANCE_PARTNER") {
      return res.status(403).json({
        success: false,
        message:
          "Only insurance partners can access this profile.",
      });
    }

    const profile =
      await InsurancePartnerProfile.findOne({
        where: {
          userId: req.user.id,
        },

        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "id",
              "email",
              "role",
              "isVerified",
              "isActive",
              "accountStatus",
            ],
          },
        ],
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Insurance partner profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: profile.id,
        partnerId: profile.partnerId,
        partnerName: profile.partnerName,
        companyName: profile.companyName,
        coverageRegion: profile.coverageRegion,
        supportHours: profile.supportHours,
        businessEmail: profile.businessEmail,
        phoneNumber: profile.phoneNumber,
        claimsTeam: profile.claimsTeam,

        account: {
          id: profile.user.id,
          email: profile.user.email,
          role: profile.user.role,
          isVerified: profile.user.isVerified,
          isActive: profile.user.isActive,
          accountStatus: profile.user.accountStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateMyInsurancePartnerProfile(
  req,
  res,
  next
) {
  try {
    if (req.user.role !== "INSURANCE_PARTNER") {
      return res.status(403).json({
        success: false,
        message:
          "Only insurance partners can update this profile.",
      });
    }

    const profile =
      await InsurancePartnerProfile.findOne({
        where: {
          userId: req.user.id,
        },
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Insurance partner profile not found.",
      });
    }

    const {
      companyName,
      partnerName,
      coverageRegion,
      supportHours,
      businessEmail,
      phoneNumber,
      claimsTeam,
    } = req.body;

    if (partnerName !== undefined && partnerName !== null) {
      profile.partnerName = String(partnerName).trim() || null;
    }

    if (
      companyName !== undefined &&
      companyName !== null
    ) {
      profile.companyName =
        String(companyName).trim() || null;
    }

    if (
      coverageRegion !== undefined &&
      coverageRegion !== null
    ) {
      profile.coverageRegion =
        String(coverageRegion).trim() || null;
    }

    if (
      supportHours !== undefined &&
      supportHours !== null
    ) {
      profile.supportHours =
        String(supportHours).trim() || null;
    }

    if (
      businessEmail !== undefined &&
      businessEmail !== null
    ) {
      const cleanEmail =
        String(businessEmail)
          .trim()
          .toLowerCase();

      if (cleanEmail) {
        const emailExists =
          await InsurancePartnerProfile.findOne({
            where: {
              businessEmail: cleanEmail,
            },
          });

        if (
          emailExists &&
          emailExists.userId !== req.user.id
        ) {
          return res.status(409).json({
            success: false,
            message:
              "This business email is already being used.",
          });
        }

        profile.businessEmail = cleanEmail;
      } else {
        profile.businessEmail = null;
      }
    }

    if (
      phoneNumber !== undefined &&
      phoneNumber !== null
    ) {
      profile.phoneNumber =
        String(phoneNumber).trim() || null;
    }

    if (
      claimsTeam !== undefined &&
      claimsTeam !== null
    ) {
      profile.claimsTeam =
        String(claimsTeam).trim() || null;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message:
        "Insurance partner profile updated successfully.",

      data: {
        id: profile.id,
        partnerId: profile.partnerId,
        partnerName: profile.partnerName,
        companyName: profile.companyName,
        coverageRegion: profile.coverageRegion,
        supportHours: profile.supportHours,
        businessEmail: profile.businessEmail,
        phoneNumber: profile.phoneNumber,
        claimsTeam: profile.claimsTeam,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  googleLogin,
  refreshToken,
  logout,
  googleTestLogin,
  googleTestCallback,
  getMyInsurancePartnerProfile,
  updateMyInsurancePartnerProfile,
};
