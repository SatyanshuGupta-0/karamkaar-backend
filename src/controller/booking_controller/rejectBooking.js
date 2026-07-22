const BookingModel = require("../../model/booking_model");
const NotificationModel = require("../../model/notification_model");

const rejectBooking = async (
  req,
  res
) => {
  try {
    const providerId = req.user.id;

    const { bookingId } = req.params;

    const { reason } = req.body;

    const booking =
      await BookingModel.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.provider?.toString() !==
      providerId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this booking",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Booking already processed",
      });
    }

    booking.status = "Rejected";

    booking.cancelReason =
      reason || "Rejected by provider";

    await booking.save();

    await NotificationModel.create({
      receiver: booking.customer,
      receiverType: "user",
      sender: providerId,
      senderType: "serviceProvider",
      type: "PROVIDER_REJECTED",
      title: "Booking rejected",
      message: `Your ${booking.service?.serviceName || "service"} booking was declined by the provider. Please try booking another provider.`,
      booking: booking._id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message:
        "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

module.exports = rejectBooking;