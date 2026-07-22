const Razorpay = require("razorpay");

// Get these from your Razorpay Dashboard -> Settings -> API Keys.
// Test-mode keys (rzp_test_...) work fine for development — nothing
// else in this file needs to change when you move to live keys.
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "[razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — " +
      "payment order creation will fail until they're added to .env"
  );
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
