const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InsuranceClaim = sequelize.define(
  "InsuranceClaim",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    serviceProviderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "service_provider_id",
    },

    reviewedByPartnerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "reviewed_by_partner_id",
    },

    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reviewed_at",
    },

    incidentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "incident_date",
    },

    incidentTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "incident_time",
    },

    damageType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "damage_type",
    },

    damageAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "damage_amount",

      validate: {
        min: 0,
      },
    },

    incidentLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "incident_location",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "SETTLED"
      ),

      allowNull: false,

      defaultValue: "PENDING",
    },
  },

  {
    tableName: "insurance_claims",

    timestamps: true,

    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        fields: ["service_provider_id"],
      },

      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = InsuranceClaim;
