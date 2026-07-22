const mongoose = require("mongoose");
const UserModel = require("../model/user_model");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const generatedAccessToken = require("../utils/generatedAccessToken");
const generatedRefreshToken = require("../utils/generatedRefreshToken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =====================================
// GOOGLE LOGIN / SIGNUP
// =====================================

const googleLoginController = async (req, res) => {
  try {
    const { token, deviceToken } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Missing token",
        success: false,
        error: true,
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        message: "Invalid Google token",
        success: false,
        error: true,
      });
    }

    const { email_verified, email, name, picture } = payload;

    if (!email_verified) {
      return res.status(400).json({
        message: "Google email not verified",
        success: false,
        error: true,
      });
    }

    const normalizedEmail = email.toLowerCase();

    let user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      user = new UserModel({
        name,
        email: normalizedEmail,
        password: "",
        verify_email: true,
        avatar: { url: picture || "", publicId: null },
        accountStatus: "Active",
        role: ["USER"],
        deviceTokens: deviceToken ? [deviceToken] : [],
        currentLocation: {
          type: "Point",
          coordinates: [0, 0],
          lastUpdated: new Date(),
        },
      });

      await user.save();
    }

    if (user.accountStatus !== "Active") {
      return res.status(403).json({
        message: "Your account is disabled",
        success: false,
        error: true,
      });
    }

    user.last_login_date = new Date();

    if (deviceToken && !user.deviceTokens.includes(deviceToken)) {
      user.deviceTokens.push(deviceToken);
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    user.access_token = accessToken;
    user.refresh_token = refreshToken;

    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("userRefreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      message: "Google login successful",
      success: true,
      error: false,
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
        },
      },
    });
  } catch (error) {
    console.log("Google Login Error:", error);

    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
      error: true,
    });
  }
};

// =====================================
// UPLOAD / REPLACE AVATAR
// =====================================

const userAvatarController = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please upload image",
        success: false,
        error: true,
      });
    }

    const imageFile = req.files[0];

    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
      folder: "users-avatar",
    });

    fs.unlinkSync(imageFile.path);

    user.avatar = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    await user.save();

    return res.status(200).json({
      message: "Avatar updated successfully",
      success: true,
      error: false,
      avatar: user.avatar,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

// =====================================
// DELETE IMAGE FROM CLOUDINARY
// =====================================

const removeImageFromCloudinary = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        message: "publicId is required",
        success: false,
        error: true,
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({
      message: "Image removed successfully",
      success: true,
      error: false,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

// =====================================
// REFRESH ACCESS TOKEN
// =====================================

const refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.userRefreshToken ||
      req.headers.authorization?.split(" ")[1];

    if (!incomingRefreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
        error: true,
        success: false,
      });
    }

    let verifyToken;

    try {
      verifyToken = jwt.verify(
        incomingRefreshToken,
        process.env.SECRET_KEY_REFRESH_TOKEN
      );
    } catch {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken.id;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (user.refresh_token !== incomingRefreshToken) {
      return res.status(401).json({
        message: "Refresh token mismatch",
        error: true,
        success: false,
      });
    }

    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
      maxAge: 1000 * 60 * 10,
    };
    

    res.cookie("accessToken", newAccessToken, cookiesOption);

    return res.status(200).json({
      message: "New access token generated",
      error: false,
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.log("Refresh Token Error:", error);

    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// =====================================
// GET LOGGED-IN USER'S DETAILS
// =====================================

const userDetails = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId)
      .select("-password -access_token -refresh_token -otp -otpExpires")
      .populate("bookings")
      .populate("favoriteProviders")
      .populate("notifications");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      error: false,
      data: user,
    });
  } catch (error) {
    console.log("User Details Error:", error);

    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// =====================================
// GET USER BY ID (admin)
// =====================================

const getUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        error: true,
        success: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId)
      .select("-password -access_token -refresh_token -otp -otpExpires")
      .populate("bookings")
      .populate("favoriteProviders")
      .populate("notifications");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      error: false,
      data: user,
    });
  } catch (error) {
    console.log("Get User By ID Error:", error);

    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

module.exports = {
  googleLoginController,
  userAvatarController,
  removeImageFromCloudinary,
  refreshToken,
  userDetails,
  getUserByIdController,
};
