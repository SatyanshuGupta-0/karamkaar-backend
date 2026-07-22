const BookingModel = require("../../model/booking_model");

const getMyBookings = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const bookings =
      await BookingModel.find({
        $or: [
          {
            customer: userId,
          },
          {
            provider: userId,
          },
        ],
      })
        .populate(
          "customer",
          "name mobile avatar"
        )
        .populate(
          "provider",
          "name mobile avatar currentLocation providerDetails"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count:
        bookings.length,
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

module.exports = getMyBookings;