const UserModel = require("../../model/user_model");
const { OAuth2Client } = require("google-auth-library");

const generatedAccessToken = require("../../utils/generatedAccessToken");
const generatedRefreshToken = require("../../utils/generatedRefreshToken");

// =====================================
// GOOGLE CLIENT
// =====================================

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =====================================
// GOOGLE LOGIN CONTROLLER
// =====================================

const googleLoginController = async (req, res) => {
  try {
    // `role` is only used the FIRST time this email signs up (i.e. when
    // we're creating a brand-new user below). If the account already
    // exists, we log them in as whatever role(s) they already have —
    // clicking "Continue with Google" on a Provider page should never
    // silently change an existing account's role.
    const { token, deviceToken, role } = req.body;
    // =====================================
    // VALIDATION
    // =====================================

    if (!token) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Google token is required",
      });
    }

    // =====================================
    // VERIFY GOOGLE TOKEN
    // =====================================

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid Google token",
      });
    }

    const { email_verified, email, name, picture } = payload;

    // =====================================
    // CHECK VERIFIED EMAIL
    // =====================================

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Google email not verified",
      });
    }

    // =====================================
    // NORMALIZE EMAIL
    // =====================================

    const normalizedEmail = email.toLowerCase();

    // =====================================
    // FIND USER
    // =====================================

    let user = await UserModel.findOne({ email: normalizedEmail });

    // =====================================
    // CREATE NEW USER (role decided here, exactly once)
    // =====================================

    if (!user) {
      let roles = [];
      let providerDetails = { isProvider: false };

      if (role === "PROVIDER") {
        roles = ["USER", "PROVIDER"];
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
      } else {
        roles = ["USER"];
      }


      user = await UserModel.create({
        name,
        email: normalizedEmail,
        password: "",
        mobile: null,
        verify_email: true,
        accountStatus: "Active",
        role: roles,
        providerDetails,
        provider: "google",
        avatar: {
          url: picture || "",
          publicId: null,
        },
        currentLocation: {
          type: "Point",
          coordinates: [0, 0],
          lastUpdated: new Date(),
        },
        deviceTokens: deviceToken ? [deviceToken] : [],
        last_login_date: new Date(),
      });
    }

    // =====================================
    // ACCOUNT STATUS CHECK
    // =====================================

    if (user.accountStatus !== "Active") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Your account is blocked or inactive",
      });
    }

    // =====================================
    // UPDATE LOGIN INFO
    // =====================================

    user.last_login_date = new Date();

    if (deviceToken && !user.deviceTokens.includes(deviceToken)) {
      user.deviceTokens.push(deviceToken);
    }

    // =====================================
    // GENERATE TOKENS
    // =====================================

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    // =====================================
    // SAVE TOKENS
    // =====================================

    user.access_token = accessToken;
    user.refresh_token = refreshToken;

    await user.save({ validateBeforeSave: false });

    // =====================================
    // COOKIE OPTIONS
    // =====================================

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    };

    // =====================================
    // SET COOKIES
    // =====================================

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("userRefreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      success: true,
      error: false,
      message: "Google login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          avatar: user.avatar?.url,
          role: user.role,
          isProvider: user.providerDetails?.isProvider || false,
        },
      },
    });
  } catch (error) {
    console.log("Google Login Error:", error);

    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = googleLoginController;