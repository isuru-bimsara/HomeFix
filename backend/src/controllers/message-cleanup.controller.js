const {
  cleanupExpiredMessages,
} = require("../utils/message-cleanup");

const cleanupMessages = async (
  req,
  res,
  next
) => {
  try {
    const cronSecret =
      process.env.CRON_SECRET;

    const authorization =
      req.headers.authorization;

    if (
      !cronSecret ||
      authorization !==
        `Bearer ${cronSecret}`
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const result =
      await cleanupExpiredMessages();

    return res.status(200).json({
      success: true,
      message:
        "Expired messages cleaned successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  cleanupMessages,
};