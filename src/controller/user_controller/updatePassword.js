const bcrypt = require(
  "bcrypt"
);

const UserModel = require(
  "../../model/user_model"
);

// =====================================
// UPDATE PASSWORD
// =====================================

const updatePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const userId =
      req.user?.id;

    // =====================================
    // CHECK AUTH USER
    // =====================================

    if (!userId) {
      return res.status(401).json({
        success: false,

        error: true,

        message:
          "Unauthorized access",
      });
    }

    // =====================================
    // VALIDATION
    // =====================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,

        error: true,

        message:
          "All fields are required",
      });
    }

    // password match
    if (
      newPassword !==
      confirmPassword
    ) {
      return res.status(400).json({
        success: false,

        error: true,

        message:
          "Passwords do not match",
      });
    }

    // password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

    if (
      !passwordRegex.test(
        newPassword
      )
    ) {
      return res.status(400).json({
        success: false,

        error: true,

        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
      });
    }

    // =====================================
    // FIND USER
    // =====================================

    const user =
      await UserModel.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,

        error: true,

        message:
          "User not found",
      });
    }

    // =====================================
    // CHECK CURRENT PASSWORD
    // =====================================

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,

        error: true,

        message:
          "Current password is incorrect",
      });
    }

    // =====================================
    // CHECK SAME PASSWORD
    // =====================================

    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,

        error: true,

        message:
          "New password cannot be same as current password",
      });
    }

    // =====================================
    // HASH PASSWORD
    // =====================================

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        salt
      );

    // =====================================
    // SAVE PASSWORD
    // =====================================

    user.password =
      hashedPassword;

    // optional logout all devices
    user.access_token = "";

    user.refresh_token = "";

    await user.save({
      validateBeforeSave: false,
    });

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      success: true,

      error: false,

      message:
        "Password updated successfully",
    });
  } catch (error) {
    console.log(
      "Update Password Error:",
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

module.exports =
  updatePassword;