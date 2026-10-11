



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

// provider accepts booking
const acceptBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { scheduledDate, scheduledTime } = req.body;

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message: "Only service providers can accept bookings.",
      });
    }

    const provider = await User.findByPk(req.user.id);

    if (
      !provider ||
      provider.accountStatus === "BANNED" ||
      provider.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is not allowed to accept bookings.",
      });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.serviceProviderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Only the selected service provider can accept this booking.",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be accepted." });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(scheduledDate || "")) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(scheduledTime || ""))) {
      return res.status(400).json({ success: false, message: "A valid service date and time are required." });
    }

    const [year, month, day] = scheduledDate.split("-").map(Number);
    const [hour, minute] = scheduledTime.split(":").map(Number);
    const calendarDate = new Date(Date.UTC(year, month - 1, day));
    const timezoneOffsetMinutes = Number(process.env.SERVICE_TIMEZONE_OFFSET_MINUTES || 330);
    const scheduledTimestamp = Date.UTC(year, month - 1, day, hour, minute) - timezoneOffsetMinutes * 60 * 1000;
    if (
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day ||
      scheduledTimestamp <= Date.now()
    ) {
      return res.status(400).json({ success: false, message: "Please select a future service date and time." });
    }

    const providerProfile = await ServiceProviderProfile.findOne({
      where: {
        userId: req.user.id,
      },
    });

    if (
      !providerProfile ||
      !["REGISTERED", "PROFILE_COMPLETED", "PENDING_VERIFICATION", "ADMIN_APPROVED", "ACTIVE"].includes(providerProfile.verificationStatus)
    ) {
      return res.status(403).json({
        success: false,
        message: "Your provider account is not active.",
      });
    }

    booking.status = "ACCEPTED";
    booking.scheduledDate = scheduledDate;
    booking.scheduledTime = `${scheduledTime}:00`;

    await booking.save();

    await notifyUser(booking.customerId, { type: "BOOKING_ACCEPTED", title: "Booking accepted", body: `Your service is scheduled for ${scheduledDate} at ${scheduledTime}.`, entityType: "BOOKING", entityId: booking.id, data: { bookingId: booking.id } });

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const startBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (req.user.role !== "SERVICE_PROVIDER" || booking.serviceProviderId !== req.user.id) return res.status(403).json({ success: false, message: "You cannot update this booking." });
    if (booking.status !== "ACCEPTED") return res.status(400).json({ success: false, message: "Only accepted bookings can be started." });
    booking.status = "WORKING";
    await booking.save();
    await notifyUser(booking.customerId, { type: "BOOKING_WORKING", title: "Work started", body: "Your service provider has started working on your booking.", entityType: "BOOKING", entityId: booking.id, data: { bookingId: booking.id } });
    return res.json({ success: true, message: "Work started successfully.", booking });
  } catch (error) { next(error); }
};

// provider rejects booking
const rejectBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { providerNote } = req.body;

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message: "Only service providers can reject bookings.",
      });
    }

    const provider = await User.findByPk(req.user.id);

    if (
      !provider ||
      provider.accountStatus === "BANNED" ||
      provider.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is not allowed to reject bookings.",
      });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.serviceProviderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Only the selected service provider can reject this booking.",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending bookings can be rejected.",
      });
    }

    booking.status = "REJECTED";
    booking.providerNote = providerNote
      ? providerNote.trim()
      : null;

    await booking.save();
    await notifyUser(booking.customerId, { type: "BOOKING_REJECTED", title: "Booking rejected", body: "The service provider could not accept your booking.", entityType: "BOOKING", entityId: booking.id, data: { bookingId: booking.id } });

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully.",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// provider completes booking
const completeBooking = async (req, res, next) => {
  const uploadedImages = [];

  try {
    const { bookingId } = req.params;
    const { providerNote } = req.body;

    if (req.user.role !== "SERVICE_PROVIDER") {
      return res.status(403).json({
        success: false,
        message: "Only service providers can complete bookings.",
      });
    }

    const provider = await User.findByPk(req.user.id);

    if (
      !provider ||
      provider.accountStatus === "BANNED" ||
      provider.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is not allowed to complete bookings.",
      });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.serviceProviderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Only the selected service provider can complete this booking.",
      });
    }

    if (booking.status !== "WORKING") {
      return res.status(400).json({
        success: false,
        message:
          "Only working bookings can be completed.",
      });
    }

    if (!providerNote || !providerNote.trim()) {
      return res.status(400).json({
        success: false,
        message: "Provider note is required when completing a booking.",
      });
    }

    if (req.files && req.files.length > 3) {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 3 completion images.",
      });
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadImageToCloudinary(
          file,
          `home-service/bookings/${booking.id}/completion`
        );

        uploadedImages.push(result.public_id);

        await BookingImage.create({
          bookingId: booking.id,
          imageType: "COMPLETION",
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    booking.status = "COMPLETED";
    booking.providerNote = providerNote.trim();
    booking.completedAt = new Date();

    await booking.save();

    await notifyUser(booking.customerId, { type: "BOOKING_COMPLETED", title: "Booking completed", body: "Your service provider marked the booking as completed.", entityType: "BOOKING", entityId: booking.id, data: { bookingId: booking.id } });

    const completedBooking = await getBookingDetails(booking.id);

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully.",
      booking: completedBooking,
    });
  } catch (error) {
    for (const publicId of uploadedImages) {
      await deleteCloudinaryImage(publicId);
    }

    next(error);
  }
};

const updateBookingCompletion = async (req, res, next) => {
  const newPublicIds = [];
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (req.user.role !== "SERVICE_PROVIDER" || booking.serviceProviderId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You cannot edit this completion." });
    }
    if (booking.status !== "COMPLETED") {
      return res.status(400).json({ success: false, message: "Only completed bookings can be edited." });
    }

    const providerNote = String(req.body.providerNote || "").trim();
    if (!providerNote) return res.status(400).json({ success: false, message: "Completion note is required." });

    if (req.files?.length) {
      const oldImages = await BookingImage.findAll({
        where: { bookingId: booking.id, imageType: "COMPLETION" },
      });
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadImageToCloudinary(
          file,
          `home-service/bookings/${booking.id}/completion`
        );
        newPublicIds.push(result.public_id);
        newImages.push({
          bookingId: booking.id,
          imageType: "COMPLETION",
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
      await BookingImage.bulkCreate(newImages);
      await BookingImage.destroy({
        where: { bookingId: booking.id, imageType: "COMPLETION", id: oldImages.map((image) => image.id) },
      });
      for (const image of oldImages) await deleteCloudinaryImage(image.publicId);
    }

    booking.providerNote = providerNote;
    await booking.save();
    return res.status(200).json({
      success: true,
      message: "Booking completion updated successfully.",
      booking: await getBookingDetails(booking.id),
    });
  } catch (error) {
    for (const publicId of newPublicIds) await deleteCloudinaryImage(publicId);
    next(error);
  }
};

const deleteBookingCompletion = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (req.user.role !== "SERVICE_PROVIDER" || booking.serviceProviderId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You cannot delete this completion." });
    }
    if (booking.status !== "COMPLETED") {
      return res.status(400).json({ success: false, message: "Only completed bookings can be reopened." });
    }

    const images = await BookingImage.findAll({
      where: { bookingId: booking.id, imageType: "COMPLETION" },
    });
    await BookingImage.destroy({
      where: { bookingId: booking.id, imageType: "COMPLETION" },
    });
    for (const image of images) await deleteCloudinaryImage(image.publicId);

    booking.status = "WORKING";
    booking.providerNote = null;
    booking.completedAt = null;
    await booking.save();
    await notifyUser(booking.customerId, {
      type: "BOOKING_WORKING",
      title: "Booking reopened",
      body: "Your service provider reopened the booking and is continuing the work.",
      entityType: "BOOKING",
      entityId: booking.id,
      data: { bookingId: booking.id },
    });
    return res.status(200).json({
      success: true,
      message: "Completion deleted. Booking returned to working status.",
      booking: await getBookingDetails(booking.id),
    });
  } catch (error) {
    next(error);
  }
};

// customer deletes their pending booking
const deleteBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    // Only customers can delete bookings
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can delete bookings.",
      });
    }

    // Find booking
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Make sure this booking belongs to the logged-in customer
    if (booking.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Only the customer who created this booking can delete it.",
      });
    }

    // Only PENDING bookings can be deleted
    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be deleted.",
      });
    }

    // Get booking images
    const images = await BookingImage.findAll({
      where: {
        bookingId: booking.id,
      },
    });

    // Delete images from Cloudinary
    for (const image of images) {
      if (image.publicId) {
        await deleteCloudinaryImage(image.publicId);
      }
    }

    // Delete image records from database
    await BookingImage.destroy({
      where: {
        bookingId: booking.id,
      },
    });

    // Delete booking
    await booking.destroy();

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);
    next(error);
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  updateBookingDetails,
  addBookingImages,
  deleteBookingImage,
  acceptBooking,
  startBooking,
  rejectBooking,
  completeBooking,
  updateBookingCompletion,
  deleteBookingCompletion,
  deleteBooking,
};
