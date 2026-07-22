const UserModel = require("../../model/user_model");

const logoutController = async (req, res) => {
  try {
    const userId = req.user?.id;

    const cookieOptions = {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
    };

    // Clear Cookies
    res.clearCookie(
      "accessToken",
      cookieOptions
    );

    res.clearCookie(
      "userRefreshToken",
      cookieOptions
    );

    // Remove tokens from DB
    if (userId) {
      await UserModel.findByIdAndUpdate(
        userId,
        {
          access_token: "",
          refresh_token: "",
        }
      );
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(
      "❌ Logout Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: true,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

module.exports = logoutController;