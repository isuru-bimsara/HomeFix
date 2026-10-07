const {
  Message,
  MessageImage,
} = require("../models");

const {
  deleteCloudinaryImage,
} = require("./cloudinary-upload");

async function cleanupExpiredMessages() {
  try {
    const expiredMessages =
      await Message.findAll({
        where: {
          expiresAt: {
            [require("sequelize").Op.lte]:
              new Date(),
          },
        },

        include: [
          {
            model: MessageImage,
            as: "images",
          },
        ],
      });

    if (
      expiredMessages.length === 0
    ) {
      return {
        deletedMessages: 0,
        deletedImages: 0,
      };
    }

    let deletedImages = 0;

    for (const message of expiredMessages) {
      for (const image of message.images) {
        await deleteCloudinaryImage(
          image.publicId
        );

        deletedImages++;
      }

      await MessageImage.destroy({
        where: {
          messageId: message.id,
        },
      });

      await Message.destroy({
        where: {
          id: message.id,
        },
      });
    }

    console.log(
      `Expired messages deleted: ${expiredMessages.length}`
    );

    console.log(
      `Cloudinary images deleted: ${deletedImages}`
    );

    return {
      deletedMessages:
        expiredMessages.length,
      deletedImages,
    };
  } catch (error) {
    console.error(
      "Message cleanup error:",
      error
    );

    throw error;
  }
}

module.exports = {
  cleanupExpiredMessages,
};