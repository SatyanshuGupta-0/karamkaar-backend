const BookingModel = require("../../model/booking_model");
const UserModel = require("../../model/user_model");

// Called by the provider's device every few seconds while a job is
// active. Updates both the booking's own `providerLiveLocation`
// snapshot and the provider's general `currentLocation` on the User
// doc — other reads (getBookingDetails' populated
// `provider.currentLocation`, nearby-provider search) come from the
// User doc, so both need to stay in sync.
const updateBookingLocation = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
    }

    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.provider || booking.provider.toString() !== providerId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking",
      });
    }

    const point = {
      type: "Point",
      // GeoJSON order is [longitude, latitude] — NOT [lat, lng].
      coordinates: [Number(longitude), Number(latitude)],
      lastUpdated: new Date(),
    };

    booking.providerLiveLocation = point;
    await booking.save();

    await UserModel.findByIdAndUpdate(providerId, {
      currentLocation: point,
    });

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      providerLiveLocation: point,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = updateBookingLocation;
