const bcrypt = require(
  "bcrypt"
);

const UserModel = require(
  "../../model/user_model"
);

// =====================================
// RESET PASSWORD
// =====================================
const resetpassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    const email = req.user?.email; // from token via middleware
    if (!email) {
      return res.status(400).json({
        message: "Invalid user information from token",
        error: true,
        success: false,
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Please provide newPassword and confirmPassword",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
      error: true,
    });
  }
};

module.exports =
  resetpassword;