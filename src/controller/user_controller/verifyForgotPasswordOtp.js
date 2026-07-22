const jwt = require(
  "jsonwebtoken"
);

const UserModel = require(
  "../../model/user_model"
);

// =====================================
// VERIFY FORGOT PASSWORD OTP
// =====================================

const verifyForgotPasswordOtp =
  async (req, res) => {
    try {
      const {
        email,
        mobile,
        otp,
      } = req.body;

      // =====================================
      // VALIDATION
      // =====================================

      if (
        (!email && !mobile) ||
        !otp
      ) {
        return res.status(400).json({
          success: false,

          error: true,

          message:
            "Email/mobile and OTP are required",
        });
      }

      // =====================================
      // FIND USER
      // =====================================

      const query = [];

      if (email) {
        query.push({
          email:
            email.toLowerCase(),
        });
      }

      if (mobile) {
        query.push({ mobile });
      }

      const user =
        await UserModel.findOne({
          $or: query,
        });

      if (!user) {
        return res.status(400).json({
          success: false,

          error: true,

          message:
            "Invalid account",
        });
      }

      // =====================================
      // CHECK OTP EXISTS
      // =====================================

      if (
        !user.otp ||
        !user.otpExpires
      ) {
        return res.status(400).json({
          success: false,

          error: true,

          message:
            "OTP not found. Please request new OTP",
        });
      }

      // =====================================
      // CHECK OTP EXPIRY
      // =====================================

      if (
        user.otpExpires <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,

          error: true,

          message:
            "OTP expired",
        });
      }

      // =====================================
      // VERIFY OTP
      // =====================================

      if (
        otp.trim() !==
        user.otp
      ) {
        return res.status(400).json({
          success: false,

          error: true,

          message:
            "Invalid OTP",
        });
      }

      // =====================================
      // CLEAR OTP
      // =====================================

      user.otp = null;

      user.otpExpires = null;

      await user.save({
        validateBeforeSave: false,
      });

      // =====================================
      // GENERATE RESET TOKEN
      // =====================================

      const resetToken =
        jwt.sign(
          {
            id: user._id,

            email:
              user.email || null,

            mobile:
              user.mobile || null,

            type:
              "reset-password",
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "15m",
          }
        );

      // =====================================
      // RESPONSE
      // =====================================

      return res.status(200).json({
        success: true,

        error: false,

        message:
          "OTP verified successfully",

        resetToken,
      });
    } catch (error) {
      console.log(
        "Verify Forgot Password OTP Error:",
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
  verifyForgotPasswordOtp;