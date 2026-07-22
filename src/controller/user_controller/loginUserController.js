const UserModel = require("../../model/user_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmailFun = require("../../config/sendEmail");
const generatedAccessToken = require("../../utils/generatedAccessToken");
const generatedRefreshToken = require("../../utils/generatedRefreshToken");


const loginUserController = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    // =====================================
    // VALIDATION
    // =====================================

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",

        error: true,

        success: false,
      });
    }

    // =====================================
    // FIND USER
    // =====================================

    const user =
      await UserModel.findOne({
        email,
      });

    if (!user) {
      return res.status(400).json({
        message:
          "User not registered",

        error: true,

        success: false,
      });
    }

    // =====================================
    // ACCOUNT STATUS
    // =====================================

    if (user.accountStatus !== "Active") {
      return res.status(403).json({
        message:
          "Your account is inactive. Contact admin.",

        error: true,

        success: false,
      });
    }

    // =====================================
    // EMAIL VERIFIED
    // =====================================

    if (!user.verify_email) {
      return res.status(400).json({
        message:
          "Please verify your email first",

        error: true,

        success: false,
      });
    }

    // =====================================
    // GOOGLE ACCOUNT CHECK
    // =====================================

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was created using Google login",

        error: true,

        success: false,
      });
    }

    // =====================================
    // PASSWORD CHECK
    // =====================================

    const checkPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!checkPassword) {
      return res.status(400).json({
        message:
          "Invalid password",

        error: true,

        success: false,
      });
    }

    // =====================================
    // GENERATE TOKENS
    // =====================================

    const accessToken =
      await generatedAccessToken(
        user._id
      );

    const refreshToken =
      await generatedRefreshToken(
        user._id
      );

    // =====================================
    // UPDATE USER LOGIN INFO
    // =====================================

    user.access_token =
      accessToken;

    user.refresh_token =
      refreshToken;

    user.last_login_date =
      new Date();

    await user.save();

    // =====================================
    // COOKIE OPTIONS
    // =====================================

     const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 1000 * 60 * 10, // 15 minutes for accessToken
    };

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 10 });
    res.cookie("userRefreshToken", refreshToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 }); // 7 days


    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      message:
        "Login successful",

      error: false,

      success: true,

      data: {
        accessToken,

        refreshToken,

        user: {
          _id: user._id,

          name: user.name,

          email: user.email,

          mobile: user.mobile,

          avatar:
            user.avatar?.url || "",

          role: user.role,

          status: user.status,

          currentLocation:
            user.currentLocation,
        },
      },
    });
  } catch (error) {
    console.error(
      "❌ Login Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Internal Server Error",

      error: true,

      success: false,
    });
  }
};

module.exports =  loginUserController ;