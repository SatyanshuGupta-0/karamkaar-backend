const User = require("../../model/user_model");

const updateLocation = async (
  req,
  res
) => {
  try {
    const { latitude, longitude } =
      req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude are required",
      });
    }

    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        currentLocation: {
          type: "Point",
          // GeoJSON order is [longitude, latitude] — NOT [lat, lng].
          coordinates: [
            Number(longitude),
            Number(latitude),
          ],
          lastUpdated: new Date(),
        },
      },
      { new: true }
    ).select("currentLocation");

    return res.status(200).json({
      success: true,
      message:
        "Location updated successfully",
      currentLocation: updatedUser?.currentLocation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

module.exports = updateLocation;
