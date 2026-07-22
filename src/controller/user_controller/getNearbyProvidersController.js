const UserModel = require("../../model/user_model");

const getNearbyProvidersController = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const {
      serviceName,
      category,
      maxDistance = 5000, // 5 KM
    } = req.query;

    const user =
      await UserModel.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [lng, lat] =
      user.currentLocation.coordinates;

    const providers =
      await UserModel.find({
        role: "PROVIDER",

        "providerDetails.isProvider":
          true,

        "providerDetails.availabilityStatus":
          "ONLINE",

        currentLocation: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [
                lng,
                lat,
              ],
            },

            $maxDistance:
              Number(maxDistance),
          },
        },

        ...(serviceName && {
          $or: [
            {
              "providerDetails.services.serviceName": {
                $regex: serviceName,
                $options: "i",
              },
            },
            {
              "providerDetails.services.keywords": {
                $regex: serviceName,
                $options: "i",
              },
            },
          ],
        }),

        ...(category && {
          "providerDetails.services.category":
            category,
        }),
      })
        .select(
          "name avatar currentLocation providerDetails"
        )
        .lean();

    return res.status(200).json({
      success: true,

      total: providers.length,

      providers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};

module.exports =
  getNearbyProvidersController;