const { DataTypes } = require("sequelize");

async function ensureInsuranceReviewDetails(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  const partnerTable = await queryInterface.describeTable("insurance_partner_profiles");
  if (!partnerTable.partner_name) {
    await queryInterface.addColumn("insurance_partner_profiles", "partner_name", {
      type: DataTypes.STRING(150),
      allowNull: true,
    });
  }

  const claimTable = await queryInterface.describeTable("insurance_claims");
  if (!claimTable.reviewed_by_partner_id) {
    await queryInterface.addColumn("insurance_claims", "reviewed_by_partner_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  }
  if (!claimTable.reviewed_at) {
    await queryInterface.addColumn("insurance_claims", "reviewed_at", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }
}

module.exports = ensureInsuranceReviewDetails;
