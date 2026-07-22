const UserModel = require("../../model/user_model");

const getProviderProfileController = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const provider =
      await UserModel.findById(
        userId
      ).select(
        "-password -access_token -refresh_token -otp"
      );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    if (
      !provider.role.includes(
        "PROVIDER"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a service provider",
      });
    }

    return res.status(200).json({
      success: true,
      provider,
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

module.exports =
  getProviderProfileController;