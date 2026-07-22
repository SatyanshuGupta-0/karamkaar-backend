const BookingModel = require("../../model/booking_model");
const UserModel = require("../../model/user_model");
const NotificationModel = require("../../model/notification_model");

const completeBooking = async (
  req,
  res
) => {
  try {
    const providerId = req.user.id;

    const { bookingId } =
      req.params;

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

    // Check Provider
    if (
      !booking.provider ||
      booking.provider.toString() !==
        providerId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this booking",
      });
    }

    // Booking must be started
    if (
      booking.status !==
      "Started"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking must be started first",
      });
    }

    // Update Booking
    booking.status =
      "Completed";

    booking.completedAt =
      new Date();

    if (
      booking.paymentMethod ===
      "COD"
    ) {
      booking.paymentStatus =
        "Paid";
    }

    await booking.save();

    // Update Provider Stats
    await UserModel.findByIdAndUpdate(
      providerId,
      {
        $inc: {
          "providerDetails.totalCompletedJobs":
            1,

          "providerDetails.totalEarnings":
            booking.totalAmount,
        },

        $set: {
          activeBooking:
            null,

          "providerDetails.availabilityStatus":
            "ONLINE",
        },
      }
    );

    // Clear Customer Active Booking
    await UserModel.findByIdAndUpdate(
      booking.customer,
      {
        activeBooking: null,
      }
    );

    await NotificationModel.create({
      receiver: booking.customer,
      receiverType: "user",
      sender: providerId,
      senderType: "serviceProvider",
      type: "BOOKING_CONFIRMED",
      title: "Service completed",
      message: `Your ${booking.service?.serviceName || "service"} booking is complete. Thanks for using ServiceHub — don't forget to leave a review!`,
      booking: booking._id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message:
        "Booking completed successfully",
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

module.exports = completeBooking;