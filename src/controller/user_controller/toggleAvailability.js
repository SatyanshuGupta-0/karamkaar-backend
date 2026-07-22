const UserModel = require("../../model/user_model");

const toggleAvailability = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId);

    if (!user || !user.providerDetails?.isProvider) {
      return res.status(403).json({
        success: false,
        message: "Only providers can update availability",
      });
    }

    const nextStatus =
      user.providerDetails.availabilityStatus === "ONLINE"
        ? "OFFLINE"
        : "ONLINE";

    user.providerDetails.availabilityStatus = nextStatus;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: `You are now ${nextStatus}`,
      availabilityStatus: nextStatus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = toggleAvailability;
