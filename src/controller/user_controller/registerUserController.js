const UserModel = require("../../model/user_model");
const bcrypt = require("bcrypt");
const sendEmailFun = require("../../config/sendEmail");
const verificationEmail = require("../../utils/verifyEmailTemplate");

const generatedAccessToken = require("../../utils/generatedAccessToken");
const generatedRefreshToken = require("../../utils/generatedRefreshToken");

const registerUserController = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      picture,
      provider,
      role, // USER or PROVIDER
    } = req.body;

    const isGoogleSignup =
      provider === "google";

    // ==========================
    // VALIDATION
    // ==========================

    if (!name) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Name is required",
      });
    }

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        error: true,
        message:
          "Email or mobile is required",
      });
    }

    if (
      !isGoogleSignup &&
      !password
    ) {
      return res.status(400).json({
        success: false,
        error: true,
        message:
          "Password is required",
      });
    }

    // ==========================
    // CHECK EXISTING USER
    // ==========================

    const existingUser =
      await UserModel.findOne({
        $or: [
          email
            ? {
              email:
                email.toLowerCase(),
            }
            : null,
          mobile
            ? { mobile }
            : null,
        ].filter(Boolean),
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: true,
        message:
          "User already exists",
      });
    }

    // ==========================
    // HASH PASSWORD
    // ==========================

    let hashedPassword = "";

    if (password) {
      hashedPassword =
        await bcrypt.hash(
          password,
          10
        );
    }

    // ==========================
    // OTP
    // ==========================

    const otp = Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

    // ==========================
    // ROLE SETUP
    // ==========================

    let roles = ["USER"];

    let providerDetails = {
      isProvider: false,
    };

    if (
      role === "PROVIDER"
    ) {
      roles = [
        "USER",
        "PROVIDER",
      ];

      providerDetails = {
        isProvider: true,

        description: "",

        experience: 0,

        serviceRadius: 5,

        availabilityStatus: "OFFLINE",

        averageRating: 0,

        totalReviews: 0,

        totalCompletedJobs: 0,

        totalEarnings: 0,

        services: [],
      };
    }

    // ==========================
    // CREATE USER
    // ==========================

    const user =
      await UserModel.create({
        name,

        email:
          email?.toLowerCase(),

        mobile,

        password:
          hashedPassword,

        avatar: {
          url: picture || "",
          publicId: null,
        },

        role: roles,

        providerDetails,

        otp: isGoogleSignup
          ? null
          : otp,

        otpExpires:
          isGoogleSignup
            ? null
            : new Date(
              Date.now() +
              10 *
              60 *
              1000
            ),

        verify_email:
          isGoogleSignup,

        status: "Active",

        last_login_date:
          new Date(),
      });

    console.log("crated user")

    // ==========================
    // NORMAL SIGNUP
    // ==========================

    // Mobile is the primary verification channel now — it's
    // required on every account, whereas email is optional. Email
    // still gets a copy when provided, but the OTP the person is
    // meant to actually use comes via SMS.

    // ==========================
    // NORMAL SIGNUP
    // ==========================

    if (!isGoogleSignup) {

      res.status(201).json({
        success: true,
        error: false,
        message: "OTP generated successfully",

        data: {
          userId: user._id,
          role,
        },
      });

      (async () => {
        try {
      if (email) {
        console.log("Sending email in background...");

        const emailSent = await sendEmailFun(
          email,
          "Verify Email",
          "",
          verificationEmail(name, otp)
        );

        console.log("Email Sent:", emailSent);
      }
        } catch (err) {
          console.error("Email Error:", err);
        }
      })();

      return;
    }
    // return res.status(201).json({
    //     success: true,
    //     error: false,
    //     message:
    //       "OTP sent successfully",

    //     data: {
    //       userId: user._id,
    //       role,
    //     },
    //   });
    // console.log("otp sent successfully")


    // ==========================
    // GOOGLE LOGIN
    // ==========================

    const accessToken =
      await generatedAccessToken(
        user._id
      );

    const refreshToken =
      await generatedRefreshToken(
        user._id
      );

    user.access_token =
      accessToken;

    user.refresh_token =
      refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    res.cookie(
      "accessToken",
      accessToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "None",
      }
    );

    res.cookie(
      "userRefreshToken",
      refreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "None",
      }
    );

    return res.status(201).json({
      success: true,
      error: false,
      message:
        "Registration successful",

      data: {
        accessToken,
        refreshToken,

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          isProvider:
            user.providerDetails
              .isProvider,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

module.exports =
  registerUserController;