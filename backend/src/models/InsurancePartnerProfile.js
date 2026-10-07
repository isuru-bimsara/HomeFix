const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InsurancePartnerProfile = sequelize.define(
  "InsurancePartnerProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "user_id",
    },

    partnerId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "partner_id",
    },

    partnerName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: "partner_name",
    },

    companyName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: "company_name",
    },

    coverageRegion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: "coverage_region",
    },

    supportHours: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: "support_hours",
    },

    businessEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "business_email",
      validate: {
        isEmail: true,
      },
    },

    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "phone_number",
    },

    claimsTeam: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: "claims_team",
    },
  },
  {
    tableName: "insurance_partner_profiles",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = InsurancePartnerProfile;
