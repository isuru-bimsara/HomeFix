



const { Booking, BookingImage, User, CustomerProfile, ServiceProviderProfile } = require("../models");
const { notifyUser } = require("../services/notification.service");

const {
    uploadImageToCloudinary,
    deleteCloudinaryImage,
} = require("../utils/cloudinary-upload");

async function getBookingDetails(bookingId) {
    return Booking.findByPk(bookingId, {
        include: [
            {
                model: User,
                as: "customer",
                attributes: [
                    "id",
                    "email",
                    "role",
                    "accountStatus",
                    "isActive",
                    "profileImageUrl",
                ],
                include: [
                    {
                        model: CustomerProfile,
                        as: "customerProfile",
                    },
                ],
            },
            {
                model: User,
                as: "serviceProvider",
                attributes: [
                    "id",
                    "email",
                    "role",
                    "accountStatus",
                    "isActive",
                    "profileImageUrl",
                ],
                include: [
                    {
                        model: ServiceProviderProfile,
                        as: "serviceProviderProfile",
                    },
                ],
            },
            {
                model: BookingImage,
                as: "images",
            },
        ],
    });
}

async function uploadCustomerBookingImages(
    files,
    bookingId,
    uploadedImages
) {
    const results = await Promise.allSettled(
        files.map(async (file) => {
            const result = await uploadImageToCloudinary(
                file,
                `home-service/bookings/${bookingId}/customer`
            );

            uploadedImages.push(result.public_id);

            return {
                bookingId,
                imageType: "CUSTOMER_REQUEST",
                imageUrl: result.secure_url,
                publicId: result.public_id,
            };
        })
    );

    const failedUpload = results.find(
        (result) => result.status === "rejected"
    );

    if (failedUpload) {
        throw failedUpload.reason;
    }

    return results.map((result) => result.value);
}

// create booking
const createBooking = async (req, res, next) => {
    const uploadedImages = [];
    let booking = null;

    try {
        if (req.user.role !== "CUSTOMER") {
            return res.status(403).json({
                success: false,
                message: "Only customers can create bookings.",
            });
        }

        const customer = await User.findByPk(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
        }

        if (
            customer.accountStatus === "BANNED" ||
            customer.isActive === false
        ) {
            return res.status(403).json({
                success: false,
                message: "Your account is not allowed to create bookings.",
            });
        }

        const {
            serviceProviderId,
            problem,
            note,
            phoneNumber,
            serviceLocation,
        } = req.body;

        if (
            !serviceProviderId ||
            !problem ||
            !phoneNumber ||
            !serviceLocation
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "serviceProviderId, problem, phoneNumber and serviceLocation are required.",
            });
        }

        const provider = await User.findOne({
            where: {
                id: serviceProviderId,
                role: "SERVICE_PROVIDER",
            },
            include: [
                {
                    model: ServiceProviderProfile,
                    as: "serviceProviderProfile",
                },
            ],
        });

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Selected service provider was not found.",
            });
        }

        if (
            provider.accountStatus === "BANNED" ||
            provider.isActive === false
        ) {
            return res.status(403).json({
                success: false,
                message: "Selected service provider is not available.",
            });
        }

        if (
            !provider.serviceProviderProfile ||
            provider.serviceProviderProfile.verificationStatus !== "REGISTERED"
        ) {
            return res.status(403).json({
                success: false,
                message: "Selected service provider is not active.",
            });
        }

        if (req.files && req.files.length > 3) {
            return res.status(400).json({
                success: false,
                message: "You can upload a maximum of 3 images.",
            });
        }

        booking = await Booking.create({
            customerId: customer.id,
            serviceProviderId,
            problem: problem.trim(),
            note: note ? note.trim() : null,
            phoneNumber: phoneNumber.trim(),
            serviceLocation: serviceLocation.trim(),
            status: "PENDING",
        });

        if (req.files && req.files.length > 0) {
            const imageRecords = await uploadCustomerBookingImages(
                req.files,
                booking.id,
                uploadedImages
            );

            await BookingImage.bulkCreate(imageRecords);
        }

        const createdBooking = await getBookingDetails(booking.id);
        await notifyUser(serviceProviderId, { type: "BOOKING_CREATED", title: "New booking request", body: "A customer created a new service booking.", entityType: "BOOKING", entityId: booking.id, data: { bookingId: booking.id } });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully.",
            booking: createdBooking,
        });
    } catch (error) {
        for (const publicId of uploadedImages) {
            await deleteCloudinaryImage(publicId);
        }

        if (booking) {
            await BookingImage.destroy({
                where: { bookingId: booking.id },
            });
            await booking.destroy();
        }

        next(error);
    }
};

// // get customer's or provider's bookings
// const getMyBookings = async (req, res, next) => {
//   try {
//     let where = {};

//     if (req.user.role === "CUSTOMER") {
//       where.customerId = req.user.id;
//     } else if (req.user.role === "SERVICE_PROVIDER") {
//       where.serviceProviderId = req.user.id;
//     } else {
//       return res.status(403).json({
//         success: false,
//         message: "You are not allowed to view these bookings.",
//       });
//     }

//     const bookings = await Booking.findAll({
//       where,
//       include: [
//         {
//           model: BookingImage,
//           as: "images",
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.status(200).json({
//       success: true,
//       bookings,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const getCustomerBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            where: {
                customerId: req.user.id,
            },

            include: [
                {
                    model: User,
                    as: "serviceProvider",
                    attributes: [
                        "id",
                        "email",
                        "role",
                        "accountStatus",
                        "isActive",
                        "profileImageUrl",
                    ],
                    include: [
                        {
                            model: ServiceProviderProfile,
                            as: "serviceProviderProfile",
                        },
                    ],
                },
                {
                    model: BookingImage,
                    as: "images",
                },
            ],

            order: [["created_at", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("GET CUSTOMER BOOKINGS ERROR:", error);
        next(error);
    }
};

const getProviderBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            where: {
                serviceProviderId: req.user.id,
            },

            include: [
                {
                    model: User,
                    as: "customer",
                    attributes: ["id", "profileImageUrl"],
                    include: [{
                        model: CustomerProfile,
                        as: "customerProfile",
                        attributes: ["firstName", "lastName"],
                    }],
                },
                {
                    model: BookingImage,
                    as: "images",
                },
            ],

            order: [["created_at", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("GET PROVIDER BOOKINGS ERROR:", error);
        next(error);
    }
};

// get one booking
const getBookingById = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await getBookingDetails(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        const isCustomer =
            booking.customerId === req.user.id;

        const isProvider =
            booking.serviceProviderId === req.user.id;

        const isAdmin = req.user.role === "ADMIN";

        if (!isCustomer && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view this booking.",
            });
        }

        return res.status(200).json({
            success: true,
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// customer updates booking details before provider accepts/rejects
const updateBookingDetails = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        const isCustomer =
            req.user.role === "CUSTOMER" &&
            booking.customerId === req.user.id;

        if (!isCustomer) {
            return res.status(403).json({
                success: false,
                message: "Only the customer who created this booking can edit it.",
            });
        }

        if (booking.status !== "PENDING") {
            return res.status(403).json({
                success: false,
                message: "Only pending bookings can be edited.",
            });
        }

        if (isCustomer) {
            const customer = await User.findByPk(req.user.id);

            if (
                !customer ||
                customer.accountStatus === "BANNED" ||
                customer.isActive === false
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not allowed to update bookings.",
                });
            }
        }

        const {
            problem,
            note,
            phoneNumber,
            serviceLocation,
        } = req.body;

        if (problem !== undefined) {
            if (!problem.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Problem cannot be empty.",
                });
            }

            booking.problem = problem.trim();
        }

        if (note !== undefined) {
            booking.note = note ? note.trim() : null;
        }

        if (phoneNumber !== undefined) {
            if (!phoneNumber.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number cannot be empty.",
                });
            }

            booking.phoneNumber = phoneNumber.trim();
        }

        if (serviceLocation !== undefined) {
            if (!serviceLocation.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Service location cannot be empty.",
                });
            }

            booking.serviceLocation = serviceLocation.trim();
        }

        await booking.save();

        const updatedBooking = await getBookingDetails(booking.id);

        return res.status(200).json({
            success: true,
            message: "Booking details updated successfully.",
            booking: updatedBooking,
        });
    } catch (error) {
        next(error);
    }
};

// customer adds images before provider accepts/rejects
const addBookingImages = async (req, res, next) => {
    const uploadedImages = [];

    try {
        const { bookingId } = req.params;

        if (req.user.role !== "CUSTOMER") {
            return res.status(403).json({
                success: false,
                message: "Only the customer can add booking images.",
            });
        }

        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (booking.customerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the customer who created this booking can add images.",
            });
        }

        if (booking.status !== "PENDING") {
            return res.status(403).json({
                success: false,
                message: "Only pending booking images can be updated.",
            });
        }

        const customer = await User.findByPk(req.user.id);

        if (
            !customer ||
            customer.accountStatus === "BANNED" ||
            customer.isActive === false
        ) {
            return res.status(403).json({
                success: false,
                message: "Your account is not allowed to update booking images.",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one image.",
            });
        }

        const existingImageCount = await BookingImage.count({
            where: {
                bookingId,
                imageType: "CUSTOMER_REQUEST",
            },
        });

        if (existingImageCount + req.files.length > 3) {
            return res.status(400).json({
                success: false,
                message: `You can have a maximum of 3 customer request images. You currently have ${existingImageCount}.`,
            });
        }

        const imageRecords = await uploadCustomerBookingImages(
            req.files,
            booking.id,
            uploadedImages
        );

        await BookingImage.bulkCreate(imageRecords);

        const updatedBooking = await getBookingDetails(booking.id);

        return res.status(200).json({
            success: true,
            message: "Booking images added successfully.",
            booking: updatedBooking,
        });
    } catch (error) {
        for (const publicId of uploadedImages) {
            await deleteCloudinaryImage(publicId);
        }

        next(error);
    }
};

// customer deletes their booking image
const deleteBookingImage = async (req, res, next) => {
    try {
        const { bookingId, imageId } = req.params;

        if (req.user.role !== "CUSTOMER") {
            return res.status(403).json({
                success: false,
                message: "Only customers can delete booking images.",
            });
        }

        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (booking.customerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the customer who created this booking can delete images.",
            });
        }

        if (booking.status !== "PENDING") {
            return res.status(403).json({
                success: false,
                message: "Only pending booking images can be updated.",
            });
        }

        const image = await BookingImage.findOne({
            where: {
                id: imageId,
                bookingId,
                imageType: "CUSTOMER_REQUEST",
            },
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Customer booking image not found.",
            });
        }

        const publicId = image.publicId;

        await image.destroy();

        await deleteCloudinaryImage(publicId);

        return res.status(200).json({
            success: true,
            message: "Booking image deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};