const BookingModel = require("../../model/booking_model");
const UserModel = require("../../model/user_model");
const NotificationModel = require("../../model/notification_model");

const cancelBooking = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const { bookingId } =
      req.params;

    const { reason } =
      req.body;

    const booking =
      await BookingModel.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    // Only customer or assigned provider
    const isCustomer =
      booking.customer?.toString() ===
      userId;

    const isProvider =
      booking.provider?.toString() ===
      userId;

        if (
      !isCustomer &&
      !isProvider
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to cancel this booking",
      });
    }

    // Cannot cancel completed booking
    if (
      booking.status ===
      "Completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed booking cannot be cancelled",
      });
    }

    // Already cancelled
    if (
      booking.status ===
      "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking already cancelled",
      });
    }

    // Update booking
    booking.status =
      "Cancelled";

    booking.cancelReason =
      reason ||
      "No reason provided";

    await booking.save();

    const otherParty = isCustomer
      ? booking.provider
      : booking.customer;

    if (otherParty) {
      await NotificationModel.create({
        receiver: otherParty,
        receiverType: isCustomer ? "serviceProvider" : "user",
        sender: userId,
        senderType: isCustomer ? "user" : "serviceProvider",
        type: "BOOKING_CANCELLED",
        title: "Booking cancelled",
        message: `The ${booking.service?.serviceName || "service"} booking has been cancelled. Reason: ${booking.cancelReason}`,
        booking: booking._id,
      }).catch(() => {});
    }

    // Clear active booking for customer
    await UserModel.findByIdAndUpdate(
      booking.customer,
      {
        activeBooking: null,
      }
    );

    // Clear active booking for provider
    if (booking.provider) {
      await UserModel.findByIdAndUpdate(
        booking.provider,
        {
          activeBooking: null,

          $set: {
            "providerDetails.availabilityStatus":
              "ONLINE",
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
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

module.exports = cancelBooking;