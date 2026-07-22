const crypto = require("crypto");

const razorpayInstance = require("../config/razorpay");

const PaymentModel = require(
  "../model/payment_model"
);

const BookingModel = require(
  "../model/booking_model"
);

// =====================================
// CREATE PAYMENT ORDER
// =====================================

const createPaymentOrder =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        bookingId,
        amount,
        paymentMethod,
      } = req.body;

      if (
        !bookingId ||
        !amount ||
        !paymentMethod
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please provide all required fields",
        });
      }

      const booking =
        await BookingModel.findById(
          bookingId
        );

      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            "Booking not found",
        });
      }

      // COD / Wallet don't go through a payment gateway — just keep
      // a local record so the rest of the app has something to
      // point at.
      if (paymentMethod !== "Online") {
        const payment =
          await PaymentModel.create({
            user: userId,
            booking: bookingId,
            amount,
            paymentMethod,
            transactionId: "TXN_" + Date.now(),
            status: "Pending",
          });

        return res.status(201).json({
          success: true,
          message: "Payment order created",
          payment,
        });
      }

      // ==========================
      // ONLINE — create a real Razorpay order
      // ==========================

      const razorpayOrder = await razorpayInstance.orders.create({
        // Razorpay wants the smallest currency unit (paise, not rupees).
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `booking_${bookingId}_${Date.now()}`,
        notes: {
          bookingId: String(bookingId),
          userId: String(userId),
        },
      });

      const payment =
        await PaymentModel.create({
          user: userId,
          booking: bookingId,
          amount,
          paymentMethod,
          transactionId: razorpayOrder.id,
          razorpayOrderId: razorpayOrder.id,
          status: "Pending",
        });

      return res.status(201).json({
        success: true,

        message:
          "Payment order created",

        payment,

        // Frontend passes this straight into Razorpay Checkout as
        // `order_id` — that's what makes the payment verifiable.
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },

        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// VERIFY PAYMENT
// =====================================

const verifyPayment =
  async (req, res) => {
    try {
      const {
        paymentId, // our Payment doc's _id
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (
        !paymentId ||
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "paymentId, razorpay_order_id, razorpay_payment_id and razorpay_signature are all required",
        });
      }

      const payment =
        await PaymentModel.findById(
          paymentId
        );

      if (!payment) {
        return res.status(404).json({
          success: false,

          message:
            "Payment not found",
        });
      }

      if (payment.razorpayOrderId !== razorpay_order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID does not match this payment",
        });
      }

      // ==========================
      // THE ACTUAL SECURITY CHECK
      // Recompute the signature ourselves from the order id +
      // payment id using our secret key, and compare it to what the
      // client sent back. This is what makes it impossible for
      // someone to fake a "successful" payment by just calling this
      // endpoint directly with status: "Paid".
      // ==========================

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const isValid = expectedSignature === razorpay_signature;

      if (!isValid) {
        payment.status = "Failed";
        await payment.save();

        return res.status(400).json({
          success: false,
          message: "Payment signature verification failed",
        });
      }

      payment.status = "Paid";
      payment.paidAt = new Date();
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;

      await payment.save();

      // update booking payment status
      // (Booking schema's field is named paymentStatus)

      await BookingModel.findByIdAndUpdate(
        payment.booking,
        {
          paymentStatus:
            payment.status,

          transactionId:
            razorpay_payment_id,
        }
      );

      return res.status(200).json({
        success: true,

        message:
          "Payment verified successfully",

        payment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// GET MY PAYMENTS
// =====================================

const getMyPayments =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const payments =
        await PaymentModel.find({
          user: userId,
        })
          .sort({
            createdAt: -1,
          })
          .populate(
            "booking"
          );

      return res.status(200).json({
        success: true,

        total: payments.length,

        payments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// GET PAYMENT BY ID
// =====================================

const getPaymentById =
  async (req, res) => {
    try {
      const { id } = req.params;

      const payment =
        await PaymentModel.findById(
          id
        )
          .populate("user")
          .populate("booking");

      if (!payment) {
        return res.status(404).json({
          success: false,

          message:
            "Payment not found",
        });
      }

      return res.status(200).json({
        success: true,

        payment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// UPDATE PAYMENT STATUS
// =====================================

const updatePaymentStatus =
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        status,
      } = req.body;

      const payment =
        await PaymentModel.findByIdAndUpdate(
          id,
          {
            status,
          },
          {
            new: true,
          }
        );

      if (!payment) {
        return res.status(404).json({
          success: false,

          message:
            "Payment not found",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Payment status updated",

        payment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// REFUND PAYMENT
// =====================================

const refundPayment =
  async (req, res) => {
    try {
      const { id } = req.params;

      const payment =
        await PaymentModel.findById(
          id
        );

      if (!payment) {
        return res.status(404).json({
          success: false,

          message:
            "Payment not found",
        });
      }

      // Only real Razorpay payments can be refunded through their
      // API — COD/Wallet just get marked refunded locally.
      if (payment.razorpayPaymentId) {
        try {
          await razorpayInstance.payments.refund(
            payment.razorpayPaymentId,
            { amount: Math.round(payment.amount * 100) }
          );
        } catch (refundError) {
          return res.status(500).json({
            success: false,
            message:
              refundError.error?.description ||
              refundError.message ||
              "Razorpay refund failed",
          });
        }
      }

      payment.status =
        "Refunded";

      payment.refundAt =
        new Date();

      await payment.save();

      return res.status(200).json({
        success: true,

        message:
          "Payment refunded successfully",

        payment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createPaymentOrder,

  verifyPayment,

  getMyPayments,

  getPaymentById,

  updatePaymentStatus,

  refundPayment,
};