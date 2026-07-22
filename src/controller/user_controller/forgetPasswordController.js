const UserModel = require(
  "../../model/user_model"
);

const sendEmailFun = require(
  "../../config/sendEmail"
);

const verifyEmailTemplate = require(
  "../../utils/verifyEmailTemplate"
);

// =====================================
// FORGOT PASSWORD CONTROLLER
// =====================================

const forgetPasswordController =
  async (req, res) => {
    try {
      const { email, mobile } =
        req.body;

      // =====================================
      // VALIDATION
      // =====================================

      if (!email && !mobile) {
        return res.status(400).json({
          success: false,

          error: true,

          message:
            "Email or mobile is required",
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

      // =====================================
      // SECURITY RESPONSE
      // =====================================

      if (!user) {
        return res.status(200).json({
          success: true,

          error: false,

          message:
            "If account exists, OTP has been sent",
        });
      }

      // =====================================
      // CHECK VERIFIED USER
      // =====================================

      if (!user.verify_email) {
        return res.status(400).json({
          success: false,

          error: true,

          message:
            "Please verify your account first",
        });
      }

      // =====================================
      // GENERATE OTP
      // =====================================

      const verifyCode =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      // =====================================
      // SAVE OTP
      // =====================================

      user.otp = verifyCode;

      user.otpExpires =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      await user.save({
        validateBeforeSave: false,
      });

      // =====================================
      // SEND EMAIL OTP
      // =====================================

      if (email) {
        const emailSent =
          await sendEmailFun(
            email,
            "Forget Password OTP - VM App",
            "",
            verifyEmailTemplate(
              user.name,
              verifyCode
            )
          );

        if (!emailSent) {
          console.warn(
            `[forgetPasswordController] Could not email OTP to ${email}. OTP: ${verifyCode}`
          );
        }
      }

      // =====================================
      // SEND MOBILE OTP
      // =====================================

      if (mobile) {
        // Twilio / Firebase / MSG91
        console.log(
          `Send OTP ${verifyCode} to ${mobile}`
        );
      }

      // =====================================
      // RESPONSE
      // =====================================

      return res.status(200).json({
        success: true,

        error: false,

        message:
          "OTP sent successfully",
      });
    } catch (error) {
      console.log(
        "Forgot Password Error:",
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
  forgetPasswordController;