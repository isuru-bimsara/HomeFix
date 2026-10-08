const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,

        resource_type: "image",

        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },

      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function processAndUploadProfileImage(
  file,
  userId
) {
  if (!file) {
    const error = new Error(
      "Profile image is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const processedImage = await sharp(file.buffer)
    .rotate()
    .resize(500, 500, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({
      quality: 85,
    })
    .toBuffer();

  return uploadBufferToCloudinary(
    processedImage,
    `home-service/users/${userId}/profile`
  );
}

async function deleteImage(publicId) {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

module.exports = {
  processAndUploadProfileImage,
  deleteImage,
};