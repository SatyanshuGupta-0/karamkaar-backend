const jwt = require("jsonwebtoken");
const UserModel = require("../model/user_model");

const generatedRefreshToken = async (userId) => {
  try {
    // 1. Create refresh token
    const token = jwt.sign(
      { id: userId },
      process.env.SECRET_KEY_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // 2. Optional: Save it in DB for future revoke support (logout etc.)
    await UserModel.findByIdAndUpdate(
      userId,
      { refresh_token: token },
      { new: true }
    );

    // 3. Return the token
    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error.message);
    throw new Error("Failed to generate refresh token");
  }
};

module.exports = generatedRefreshToken;
