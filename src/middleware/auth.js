const jwt = require("jsonwebtoken");

const UserModel = require(
  "../model/user_model"
);

const auth = async (
  req,
  res,
  next
) => {
  try {
    // =====================================
    // GET TOKEN
    // =====================================

    const token =
      req.cookies.accessToken ||
      req.headers.authorization?.split(
        " "
      )[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // =====================================
    // VERIFY TOKEN
    // =====================================

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY_ACCESS_TOKEN
    );

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // =====================================
    // FIND USER
    // =====================================

    const user =
      await UserModel.findById(
        decoded.id
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // =====================================
    // SAVE USER
    // =====================================

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.message ||
        "Authentication failed",
    });
  }
};

module.exports = auth;