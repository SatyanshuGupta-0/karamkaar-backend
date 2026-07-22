const UserModel = require("../../model/user_model");
const sendSmsFun = require("../../config/sendSms");

const sendMobileOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "mobile is required",
      });
    }

    // Someone else already owns this number — don't let a second
    // account claim it via the verify-profile flow.
    const takenBy = await UserModel.findOne({
      mobile,
      _id: { $ne: req.user.id },
    });

    if (takenBy) {
      return res.status(400).json({
        success: false,
        message: "This mobile number is already in use",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await UserModel.findByIdAndUpdate(req.user.id, {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    const sent = await sendSmsFun(
      mobile,
      `Your ServiceHub verification code is ${otp}. It expires in 10 minutes.`
    );

    if (!sent) {
      console.warn(
        `[sendMobileOtp] Could not SMS OTP to ${mobile}. OTP: ${otp}`
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

module.exports = sendMobileOtp;
