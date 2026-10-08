const { Op } = require("sequelize");

const {
  User,
  ServiceProviderProfile,
} = require("../models");

const checkCustomer = (req, res) => {
  if (req.user.role !== "CUSTOMER") {
    res.status(403).json({
      success: false,
      message: "Only customers can access service providers.",
    });

    return false;
  }

  return true;
};

// Get all service providers
const getAllProviders = async (req, res, next) => {
  try {
    if (!checkCustomer(req, res)) {
      return;
    }

    const search = req.query.search
      ? req.query.search.trim()
      : "";

    const profileWhere = {
      verificationStatus: "REGISTERED",
    };

    if (search) {
      profileWhere[Op.or] = [
        {
          firstName: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          lastName: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          serviceLocation: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          serviceCategory: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const providers = await User.findAll({
      where: {
        role: "SERVICE_PROVIDER",
        accountStatus: "REGISTERED",
        isActive: true,
      },

      attributes: [
        "id",
        "email",
        "role",
        "accountStatus",
        "isActive",
        "profileImageUrl",
        "profileImageSource",
      ],

      include: [
        {
          model: ServiceProviderProfile,
          as: "serviceProviderProfile",
          where: profileWhere,
          required: true,

          attributes: [
            "id",
            "userId",
            "firstName",
            "lastName",
            "phoneNumber",
            "serviceLocation",
            "serviceCategory",
            "experienceYears",
            "hourlyRate",
            "description",
            "verificationStatus",
          ],
        },
      ],

      order: [
        [
          {
            model: ServiceProviderProfile,
            as: "serviceProviderProfile",
          },
          "firstName",
          "ASC",
        ],
      ],
    });

    const formattedProviders = providers.map((provider) => {
      const profile =
        provider.serviceProviderProfile;

      return {
        id: provider.id,
        email: provider.email,
        role: provider.role,
        accountStatus: provider.accountStatus,
        isActive: provider.isActive,

        profileImageUrl:
          provider.profileImageUrl,

        profileImageSource:
          provider.profileImageSource,

        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        serviceLocation:
          profile.serviceLocation,
        serviceCategory:
          profile.serviceCategory,
        experienceYears:
          profile.experienceYears,
        hourlyRate: profile.hourlyRate,
        description: profile.description,
        verificationStatus:
          profile.verificationStatus,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedProviders.length,
      providers: formattedProviders,
    });
  } catch (error) {
    next(error);
  }
};

// Get one service provider
const getProviderById = async (req, res, next) => {
  try {
    if (!checkCustomer(req, res)) {
      return;
    }

    const { providerId } = req.params;

    const provider = await User.findOne({
      where: {
        id: providerId,
        role: "SERVICE_PROVIDER",
        accountStatus: "REGISTERED",
        isActive: true,
      },

      attributes: [
        "id",
        "email",
        "role",
        "accountStatus",
        "isActive",
        "profileImageUrl",
        "profileImageSource",
        "googleProfileImageUrl",
      ],

      include: [
        {
          model: ServiceProviderProfile,
          as: "serviceProviderProfile",
          where: {
            verificationStatus: "REGISTERED",
          },
          required: true,

          attributes: [
            "id",
            "userId",
            "firstName",
            "lastName",
            "phoneNumber",
            "serviceLocation",
            "serviceCategory",
            "experienceYears",
            "hourlyRate",
            "description",
            "verificationStatus",
          ],
        },
      ],
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message:
          "Service provider not found.",
      });
    }

    const profile =
      provider.serviceProviderProfile;

    return res.status(200).json({
      success: true,

      provider: {
        id: provider.id,
        email: provider.email,
        role: provider.role,
        accountStatus:
          provider.accountStatus,
        isActive: provider.isActive,

        profileImageUrl:
          provider.profileImageUrl,

        profileImageSource:
          provider.profileImageSource,

        googleProfileImageUrl:
          provider.googleProfileImageUrl,

        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,

        serviceLocation:
          profile.serviceLocation,

        serviceCategory:
          profile.serviceCategory,

        experienceYears:
          profile.experienceYears,

        hourlyRate: profile.hourlyRate,

        description:
          profile.description,

        verificationStatus:
          profile.verificationStatus,

        // These are not in the current database model.
        // They are intentionally not stored.
        startingPrice: null,
        servicesOffered: null,
        availability: null,
        responseRate: null,
        completionRate: null,
        jobsCompleted: null,
        recentWorkImages: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProviders,
  getProviderById,
};
