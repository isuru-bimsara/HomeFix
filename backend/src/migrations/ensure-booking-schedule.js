const { DataTypes } = require("sequelize");

async function ensureBookingSchedule(sequelize) {
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable("bookings");
    if (!table.scheduled_date) await queryInterface.addColumn("bookings", "scheduled_date", { type: DataTypes.DATEONLY, allowNull: true });
    if (!table.scheduled_time) await queryInterface.addColumn("bookings", "scheduled_time", { type: DataTypes.TIME, allowNull: true });
}

module.exports = ensureBookingSchedule;
