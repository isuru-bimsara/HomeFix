async function ensureDirectMessages(sequelize) {
  const [rows] = await sequelize.query(`
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'messages'
      AND column_name = 'booking_id'
  `);

  if (rows.length && rows[0].is_nullable === "NO") {
    await sequelize.query(
      'ALTER TABLE "messages" ALTER COLUMN "booking_id" DROP NOT NULL'
    );
  }
}

module.exports = ensureDirectMessages;
