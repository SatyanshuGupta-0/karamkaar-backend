const mongoose = require("mongoose");

const paymentSchema =
  new mongoose.Schema(
    {
      booking: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },

      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      provider: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      amount: Number,

      paymentMethod: {
        type: String,
        enum: [
          "COD",
          "Online",
          "Wallet",
        ],
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Paid",
          "Failed",
          "Refunded",
        ],
        default: "Pending",
      },

      paidAt: {
        type: Date,
        default: null,
      },

      refundAt: {
        type: Date,
        default: null,
      },

      transactionId: String,

      // Real Razorpay identifiers — set once an order is actually
      // created with the Razorpay API, and once Checkout hands back
      // a completed payment.
      razorpayOrderId: {
        type: String,
        default: "",
      },

      razorpayPaymentId: {
        type: String,
        default: "",
      },

      razorpaySignature: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);