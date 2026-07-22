const BookingModel = require("../../model/booking_model");

const startBooking = async (
  req,
  res
) => {
  try {
    const providerId = req.user.id;
    const { bookingId } = req.params;

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

    // Provider ownership check
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

    // Status check
    if (
      booking.status !== "Accepted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking must be accepted first",
      });
    }

    // OTP verification check
    if (!booking.isOtpVerified) {
      return res.status(400).json({
        success: false,
        message:
          "OTP verification required before starting service",
      });
    }

    booking.status = "Started";

    booking.startedAt =
      new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Service started successfully",
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

module.exports = startBooking;