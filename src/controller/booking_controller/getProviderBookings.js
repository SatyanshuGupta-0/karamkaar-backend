const BookingModel = require("../../model/booking_model");

const getProviderBookings = async (
  req,
  res
) => {
  try {
    const providerId = req.user.id;

    const bookings = await BookingModel.find({
      provider: providerId,
    })
      .populate(
        "customer",
        "name mobile avatar"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
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

module.exports = getProviderBookings;
