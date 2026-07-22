const UserModel = require("../../model/user_model");

const verifyOtpController = async ( req , res ) => {
  try {
    const { email, mobile, otp } = req.body;


    console.log(email, mobile, otp)
    if (!otp) {
      return res.status(400).json({
        success: false,
        error: true,
        message:"OTP is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: true,
        message:"Email or mobile is required",
      });
    }
    
    const query = [];

    if (email) {
      query.push({
        email:
          email.toLowerCase(),
      });
    }

    // if (mobile) {
    //   query.push({ mobile });
    // }

    const user =
      await UserModel.findOne({
        $or: query,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message:"User not found",
      });
    }

    const isOtpValid =
      user.otp === otp;

    const isOtpExpired =
      user.otpExpires <
      new Date();

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid OTP",
      });
    }

    if (isOtpExpired) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "OTP expired",
      });
    }

    user.verify_email = true;
    user.verify_mobile = true;
    user.otp = null;
    user.otpExpires = null;
    user.last_login_date =
      new Date();

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      error: false,
      message:
        "OTP verified successfully",
    });

  } catch (error) {
    console.error(
      "Verify OTP Error:",
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

module.exports = verifyOtpController;