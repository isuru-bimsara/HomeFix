const { DataTypes } = require("sequelize");

async function ensureHourlyRateColumn(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable(
    "service_provider_profiles"
  );

  if (!table.hourly_rate) {
    await queryInterface.addColumn(
      "service_provider_profiles",
      "hourly_rate",
      {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      }
    );
  }
}

module.exports = ensureHourlyRateColumn;
