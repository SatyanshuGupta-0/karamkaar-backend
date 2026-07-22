const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
  getPaymentById,
  updatePaymentStatus,
  refundPayment,
} = require("../controller/payment_contoller");

// =====================================
// CREATE PAYMENT ORDER
// =====================================

router.post(
  "/create-order",
  auth,
  createPaymentOrder
);

// =====================================
// VERIFY PAYMENT
// =====================================

router.post(
  "/verify",
  auth,
  verifyPayment
);

// =====================================
// GET USER PAYMENTS
// =====================================

router.get(
  "/my-payments",
  auth,
  getMyPayments
);

// =====================================
// GET SINGLE PAYMENT
// =====================================

router.get(
  "/:id",
  auth,
  getPaymentById
);

// =====================================
// UPDATE PAYMENT STATUS
// (Admin / System)
// =====================================

router.put(
  "/update-status/:id",
  auth,
  updatePaymentStatus
);

// =====================================
// REFUND PAYMENT
// =====================================

router.post(
  "/refund/:id",
  auth,
  refundPayment
);

module.exports = router;