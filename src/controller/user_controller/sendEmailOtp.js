const UserModel = require("../../model/user_model");
const sendEmailFun = require("../../config/sendEmail");
const verificationEmail = require("../../utils/verifyEmailTemplate");

const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    const takenBy = await UserModel.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.user.id },
    });

    if (takenBy) {
      return res.status(400).json({
        success: false,
        message: "This email is already in use",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
      { new: true }
    );

    const sent = await sendEmailFun(
      email,
      "Verify your email",
      "",
      verificationEmail(user?.name, otp)
    );

    if (!sent) {
      console.warn(
        `[sendEmailOtp] Could not email OTP to ${email}. OTP: ${otp}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = sendEmailOtp;
