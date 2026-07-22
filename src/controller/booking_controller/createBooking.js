const BookingModel = require("../../model/booking_model");
const UserModel = require("../../model/user_model");
const NotificationModel = require("../../model/notification_model");

const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;

    const {
      providerId,
      serviceId,
      address,
      scheduledDate,
      paymentMethod,
      customerNote,
    } = req.body;

    // ==========================
    // VALIDATION
    // ==========================

    if (
      !providerId ||
      !serviceId ||
      !address?.fullAddress ||
      !address?.location?.coordinates
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ==========================
    // FIND PROVIDER
    // ==========================

    const provider =
      await UserModel.findById(providerId);

    if (
      !provider ||
      !provider.providerDetails?.isProvider
    ) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // ==========================
    // FIND SERVICE
    // ==========================

    const service =
      provider.providerDetails.services.id(
        serviceId
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ==========================
    // CREATE BOOKING
    // ==========================

    const booking =
      await BookingModel.create({
        customer: customerId,

        provider: providerId,

        service: {
          serviceId: service._id,

          serviceName:
            service.serviceName,

          category:
            service.category,

          price: service.price,
        },

        address,

        scheduledDate,

        paymentMethod:
          paymentMethod || "COD",

        servicePrice:
          service.price,

        totalAmount:
          service.price,

        customerNote:
          customerNote || "",
      });

    // ==========================
    // SAVE REFERENCES
    // ==========================

    await UserModel.findByIdAndUpdate(
      customerId,
      {
        $push: {
          bookings: booking._id,
        },

        activeBooking:
          booking._id,
      }
    );

    await UserModel.findByIdAndUpdate(
      providerId,
      {
        $push: {
          bookings: booking._id,
        },
      }
    );

    await NotificationModel.create({
      receiver: providerId,
      receiverType: "serviceProvider",
      sender: customerId,
      senderType: "user",
      type: "NEW_SERVICE_REQUEST",
      title: "New booking request",
      message: `You have a new ${service.serviceName} request. Accept it to get started.`,
      booking: booking._id,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = createBooking;