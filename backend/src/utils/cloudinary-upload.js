const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

async function uploadImageToCloudinary(file, folder) {
  const processedImage = await sharp(file.buffer)
    .rotate()
    .resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 85,
    })
    .toBuffer();

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, uploadResult) => {
        if (error) {
          return reject(error);
        }

        resolve(uploadResult);
      }
    );

    uploadStream.end(processedImage);
  });

  return result;
}

async function deleteCloudinaryImage(publicId) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error(
      "Cloudinary image deletion failed:",
      error.message
    );
  }
}

module.exports = {
  uploadImageToCloudinary,
  deleteCloudinaryImage,
};