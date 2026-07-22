const BookingModel = require("../../model/booking_model");

const getBookingDetails = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const { bookingId } =
      req.params;

    const booking =
      await BookingModel.findById(
        bookingId
      )
        .populate(
          "customer",
          "name email mobile avatar address"
        )
        .populate(
          "provider",
          "name email mobile avatar currentLocation providerDetails"
        )
        .populate(
          "review"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    const isCustomer =
      booking.customer?._id.toString() ===
      userId;

    const isProvider =
      booking.provider?._id.toString() ===
      userId;

    const isAdmin =
      req.user.role?.includes(
        "ADMIN"
      );

    if (
      !isCustomer &&
      !isProvider &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

module.exports = getBookingDetails;