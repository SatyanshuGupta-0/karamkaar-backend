const jwt = require("jsonwebtoken");

const generatedAccessToken = (userId) => {
  try {
    const token = jwt.sign(
      { id: userId },
      process.env.SECRET_KEY_ACCESS_TOKEN,
      { expiresIn: "10m" }
    );
    return token;
  } catch (error) {
    console.error("Error generating access token:", error.message);
    throw new Error("Failed to generate access token");
  }
};

module.exports = generatedAccessToken;
