const BookingModel = require("../../model/booking_model");

const deleteBooking = async (
  req,
  res
) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isOwner =
      booking.customer?.toString() === userId ||
      booking.provider?.toString() === userId;

    const isAdmin = req.user.role?.includes("ADMIN");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this booking",
      });
    }

    // Only allow deleting bookings that are already finished/closed
    // out — active bookings should be cancelled instead.
    if (
      !["Completed", "Rejected", "Cancelled"].includes(
        booking.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only completed, rejected or cancelled bookings can be deleted",
      });
    }

    await BookingModel.findByIdAndDelete(bookingId);

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = deleteBooking;
