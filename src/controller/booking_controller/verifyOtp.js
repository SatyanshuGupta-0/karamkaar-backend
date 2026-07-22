const BookingModel = require("../../model/booking_model");

const verifyOtp = async (
  req,
  res
) => {
  try {
    const providerId = req.user.id;

    const {
      bookingId,
      otp,
    } = req.body;

    if (!bookingId || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID and OTP are required",
      });
    }

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

    // Check provider
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

    // Booking should be accepted
    if (
      booking.status !== "Accepted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is not accepted yet",
      });
    }

    // Already verified
    if (
      booking.isOtpVerified
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP already verified",
      });
    }

    // OTP match
    if (booking.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    booking.isOtpVerified =
      true;

    booking.otp = "";

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully",
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

module.exports = verifyOtp;