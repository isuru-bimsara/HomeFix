// const sharp = require("sharp");

// const {
//   User,
//   CustomerProfile,
//   ServiceProviderProfile,
// } = require("../models");

// const cloudinary =
//   require("../config/cloudinary");

// // get profile
// async function getMyProfile(
//   req,
//   res,
//   next
// ) {
//   try {
//     const user =
//       await User.findByPk(
//         req.user.id,
//         {
//           include: [
//             {
//               model: CustomerProfile,
//               as: "customerProfile",
//             },
//             {
//               model:
//                 ServiceProviderProfile,
//               as:
//                 "serviceProviderProfile",
//             },
//           ],
//         }
//       );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "User not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         user: {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//           isVerified:
//             user.isVerified,
//           isActive:
//             user.isActive,
//           profileImageUrl:
//             user.profileImageUrl,
//           profileImageSource:
//             user.profileImageSource,
//           googleProfileImageUrl:
//             user.googleProfileImageUrl,
//         },
//         customerProfile:
//           user.customerProfile ||
//           null,
//         serviceProviderProfile:
//           user.serviceProviderProfile ||
//           null,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // update profile
// async function updateMyProfile(
//   req,
//   res,
//   next
// ) {
//   try {
//     const user =
//       await User.findByPk(
//         req.user.id
//       );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "User not found.",
//       });
//     }

//     const {
//       firstName,
//       lastName,
//       phoneNumber,
//       town,
//       homeAddress,
//       serviceLocation,
//       serviceCategory,
//       experienceYears,
//       description,
//     } = req.body;

//     const uploadToCloudinary = (buffer, userId) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           folder: `home-service/users/${userId}/profile`,
//           resource_type: "image",
//         },
//         (error, result) => {
//           if (error) {
//             return reject(error);
//           }

//           resolve(result);
//         }
//       )
//       .end(buffer);
//   });
// };

//     // customer
//     if (
//       user.role ===
//       "CUSTOMER"
//     ) {
//       const profile =
//         await CustomerProfile.findOne({
//           where: {
//             userId: user.id,
//           },
//         });

//       if (!profile) {
//         return res.status(404).json({
//           success: false,
//           message:
//             "Customer profile not found.",
//         });
//       }

//       if (
//         firstName !== undefined
//       ) {
//         profile.firstName =
//           String(firstName).trim();
//       }

//       if (
//         lastName !== undefined
//       ) {
//         profile.lastName =
//           String(lastName).trim();
//       }

//       if (
//         phoneNumber !== undefined
//       ) {
//         profile.phoneNumber =
//           phoneNumber;
//       }

//       if (
//         town !== undefined
//       ) {
//         profile.town =
//           String(town).trim();
//       }

//       if (
//         homeAddress !== undefined
//       ) {
//         profile.homeAddress =
//           String(homeAddress).trim();
//       }

//       await profile.save();
//     }

//     // service provider
//     if (
//       user.role ===
//       "SERVICE_PROVIDER"
//     ) {
//       const profile =
//         await ServiceProviderProfile.findOne({
//           where: {
//             userId: user.id,
//           },
//         });

//       if (!profile) {
//         return res.status(404).json({
//           success: false,
//           message:
//             "Service provider profile not found.",
//         });
//       }

//       if (
//         firstName !== undefined
//       ) {
//         profile.firstName =
//           String(firstName).trim();
//       }

//       if (
//         lastName !== undefined
//       ) {
//         profile.lastName =
//           String(lastName).trim();
//       }

//       if (
//         phoneNumber !== undefined
//       ) {
//         profile.phoneNumber =
//           phoneNumber;
//       }

//       if (
//         serviceLocation !==
//         undefined
//       ) {
//         profile.serviceLocation =
//           String(
//             serviceLocation
//           ).trim();
//       }

//       if (
//         serviceCategory !==
//         undefined
//       ) {
//         profile.serviceCategory =
//           String(
//             serviceCategory
//           ).trim();
//       }

//       if (
//         experienceYears !==
//         undefined
//       ) {
//         const years =
//           Number(
//             experienceYears
//           );

//         if (
//           !Number.isInteger(
//             years
//           ) ||
//           years < 0 ||
//           years > 100
//         ) {
//           return res.status(400).json({
//             success: false,
//             message:
//               "Experience years must be between 0 and 100.",
//           });
//         }

//         profile.experienceYears =
//           years;
//       }

//       if (
//         description !== undefined
//       ) {
//         profile.description =
//           String(
//             description
//           ).trim();
//       }

//       await profile.save();
//     }

//     return getMyProfile(
//       req,
//       res,
//       next
//     );
//   } catch (error) {
//     next(error);
//   }
// }

// // upload profile image
// async function uploadProfileImage(
//   req,
//   res,
//   next
// ) {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Profile image is required.",
//       });
//     }

//     const user =
//       await User.findByPk(
//         req.user.id
//       );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "User not found.",
//       });
//     }

//     const processedImage =
//       await sharp(
//         req.file.buffer
//       )
//         .rotate()
//         .resize(
//           500,
//           500,
//           {
//             fit: "cover",
//             position: "centre",
//           }
//         )
//         .jpeg({
//           quality: 85,
//         })
//         .toBuffer();

//     const result =
//       await new Promise(
//         (
//           resolve,
//           reject
//         ) => {
//           const stream =
//             cloudinary.uploader.upload_stream(
//               {
//                 folder:
//                   `home-service/users/${user.id}/profile`,
//                 resource_type:
//                   "image",
//                 transformation: [
//                   {
//                     width: 500,
//                     height: 500,
//                     crop: "fill",
//                     gravity: "face",
//                     quality: "auto",
//                     fetch_format: "auto",
//                   },
//                 ],
//               },
//               (
//                 error,
//                 uploadResult
//               ) => {
//                 if (error) {
//                   return reject(
//                     error
//                   );
//                 }

//                 resolve(
//                   uploadResult
//                 );
//               }
//             );

//           stream.end(
//             processedImage
//           );
//         }
//       );

//     const oldPublicId =
//       user.profileImagePublicId;

//     const oldImageWasCustom =
//       user.profileImageSource ===
//       "CUSTOM";

//     user.profileImageUrl =
//       result.secure_url;

//     user.profileImagePublicId =
//       result.public_id;

//     user.profileImageSource =
//       "CUSTOM";

//     await user.save();

//     if (
//       oldPublicId &&
//       oldImageWasCustom
//     ) {
//       try {
//         await cloudinary.uploader.destroy(
//           oldPublicId,
//           {
//             resource_type:
//               "image",
//             invalidate: true,
//           }
//         );
//       } catch (deleteError) {
//         console.error(
//           "Old image deletion failed:",
//           deleteError.message
//         );
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Profile image updated successfully.",
//       data: {
//         profileImageUrl:
//           user.profileImageUrl,
//         profileImageSource:
//           user.profileImageSource,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // remove profile image
// async function removeProfileImage(
//   req,
//   res,
//   next
// ) {
//   try {
//     const user =
//       await User.findByPk(
//         req.user.id
//       );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "User not found.",
//       });
//     }

//     const oldPublicId =
//       user.profileImagePublicId;

//     if (
//       user.googleProfileImageUrl
//     ) {
//       user.profileImageUrl =
//         user.googleProfileImageUrl;

//       user.profileImageSource =
//         "GOOGLE";
//     } else {
//       user.profileImageUrl =
//         null;

//       user.profileImageSource =
//         "NONE";
//     }

//     user.profileImagePublicId =
//       null;

//     await user.save();

//     if (oldPublicId) {
//       try {
//         await cloudinary.uploader.destroy(
//           oldPublicId,
//           {
//             resource_type:
//               "image",
//             invalidate: true,
//           }
//         );
//       } catch (error) {
//         console.error(
//           "Cloudinary deletion failed:",
//           error.message
//         );
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Profile image removed successfully.",
//       data: {
//         profileImageUrl:
//           user.profileImageUrl,
//         profileImageSource:
//           user.profileImageSource,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// module.exports = {
//   getMyProfile,
//   updateMyProfile,
//   uploadProfileImage,
//   removeProfileImage,
// };



const sharp = require("sharp");

const {
  User,
  CustomerProfile,
  ServiceProviderProfile,
} = require("../models");

const cloudinary = require("../config/cloudinary");

async function getMyProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: CustomerProfile,
          as: "customerProfile",
        },
        {
          model: ServiceProviderProfile,
          as: "serviceProviderProfile",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
          profileImageUrl: user.profileImageUrl,
          profileImageSource: user.profileImageSource,
          googleProfileImageUrl: user.googleProfileImageUrl,
        },

        customerProfile: user.customerProfile || null,

        serviceProviderProfile:
          user.serviceProviderProfile || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      town,
      homeAddress,
      serviceLocation,
      serviceCategory,
      experienceYears,
      hourlyRate,
      description,
    } = req.body;

    if (user.role === "CUSTOMER") {
      const profile = await CustomerProfile.findOne({
        where: {
          userId: user.id,
        },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Customer profile not found.",
        });
      }

      if (firstName !== undefined) {
        profile.firstName = String(firstName).trim();
      }

      if (lastName !== undefined) {
        profile.lastName = String(lastName).trim();
      }

      if (phoneNumber !== undefined) {
        profile.phoneNumber = String(phoneNumber).trim();
      }

      if (town !== undefined) {
        profile.town = String(town).trim();
      }

      if (homeAddress !== undefined) {
        profile.homeAddress = String(homeAddress).trim();
      }

      await profile.save();
    }

    if (user.role === "SERVICE_PROVIDER") {
      const profile = await ServiceProviderProfile.findOne({
        where: {
          userId: user.id,
        },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Service provider profile not found.",
        });
      }

      if (firstName !== undefined) {
        profile.firstName = String(firstName).trim();
      }

      if (lastName !== undefined) {
        profile.lastName = String(lastName).trim();
      }

      if (phoneNumber !== undefined) {
        profile.phoneNumber = String(phoneNumber).trim();
      }

      if (serviceLocation !== undefined) {
        profile.serviceLocation = String(serviceLocation).trim();
      }

      if (serviceCategory !== undefined) {
        profile.serviceCategory = String(serviceCategory).trim();
      }

      if (experienceYears !== undefined) {
        const years = Number(experienceYears);

        if (!Number.isInteger(years) || years < 0 || years > 25000) {
          return res.status(400).json({
            success: false,
            message: "Experience years must be between 0 and 25000.",
          });
        }

        profile.experienceYears = years;
      }

      if (hourlyRate !== undefined) {
        const rate = Number(hourlyRate);

        if (!Number.isFinite(rate) || rate < 0 || rate > 1000000) {
          return res.status(400).json({
            success: false,
            message: "Hourly rate must be between 0 and 1,000,000.",
          });
        }

        profile.hourlyRate = rate;
      }

      if (description !== undefined) {
        profile.description = String(description).trim();
      }

      await profile.save();
    }

    return getMyProfile(req, res, next);
  } catch (error) {
    next(error);
  }
}

async function uploadProfileImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const oldPublicId = user.profileImagePublicId;

    const oldImageWasCustom =
      user.profileImageSource === "CUSTOM";

    const processedImage = await sharp(req.file.buffer)
      .rotate()
      .resize(500, 500, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
      })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `home-service/users/${user.id}/profile`,
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

    await user.update({
      profileImageUrl: result.secure_url,
      profileImagePublicId: result.public_id,
      profileImageSource: "CUSTOM",
    });

    if (oldPublicId && oldImageWasCustom) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch (deleteError) {
        console.error(
          "Old Cloudinary image deletion failed:",
          deleteError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully.",
      data: {
        profileImageUrl: user.profileImageUrl,
        profileImagePublicId: user.profileImagePublicId,
        profileImageSource: user.profileImageSource,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function removeProfileImage(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const oldPublicId = user.profileImagePublicId;

    const wasCustomImage =
      user.profileImageSource === "CUSTOM";

    if (wasCustomImage && oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch (deleteError) {
        console.error(
          "Cloudinary image deletion failed:",
          deleteError.message
        );
      }
    }

    if (user.googleProfileImageUrl) {
      await user.update({
        profileImageUrl: user.googleProfileImageUrl,
        profileImagePublicId: null,
        profileImageSource: "GOOGLE",
      });
    } else {
      await user.update({
        profileImageUrl: null,
        profileImagePublicId: null,
        profileImageSource: "NONE",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile image removed successfully.",
      data: {
        profileImageUrl: user.profileImageUrl,
        profileImageSource: user.profileImageSource,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  removeProfileImage,
};
