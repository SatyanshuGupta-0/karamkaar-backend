const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingDetails,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  deleteBooking,
  verifyOtp,
  updateBookingLocation,
} = require("../controller/booking_controller");

// =====================================
// CREATE BOOKING (customer books a specific provider + service)
// =====================================

router.post(
  "/create",
  auth,
  createBooking
);

// =====================================
// GET MY BOOKINGS (customer or provider — booking model relates both ways)
// =====================================

router.get(
  "/my-bookings",
  auth,
  getMyBookings
);

// =====================================
// GET PROVIDER'S BOOKINGS (provider dashboard)
// =====================================

router.get(
  "/provider-bookings",
  auth,
  getProviderBookings
);

// =====================================
// GET SINGLE BOOKING (used for live tracking + details)
// =====================================

router.get(
  "/:bookingId",
  auth,
  getBookingDetails
);

// =====================================
// ACCEPT BOOKING (provider)
// =====================================

router.put(
  "/accept/:bookingId",
  auth,
  acceptBooking
);

// =====================================
// REJECT BOOKING (provider)
// =====================================

router.put(
  "/reject/:bookingId",
  auth,
  rejectBooking
);

// =====================================
// VERIFY ON-ARRIVAL OTP (provider enters the code the customer gives them)
// =====================================

router.post(
  "/verify-otp",
  auth,
  verifyOtp
);

// =====================================
// START BOOKING (provider, after OTP verified)
// =====================================

router.put(
  "/start/:bookingId",
  auth,
  startBooking
);

// =====================================
// COMPLETE BOOKING (provider)
// =====================================

router.put(
  "/complete/:bookingId",
  auth,
  completeBooking
);

// =====================================
// CANCEL BOOKING (customer or provider)
// =====================================

router.put(
  "/cancel/:bookingId",
  auth,
  cancelBooking
);

// =====================================
// UPDATE PROVIDER LIVE LOCATION (provider, while a job is active)
// =====================================

router.patch(
  "/:bookingId/location",
  auth,
  updateBookingLocation
);

// =====================================
// DELETE BOOKING (cleanup, closed bookings only)
// =====================================

router.delete(
  "/delete/:bookingId",
  auth,
  deleteBooking
);

module.exports = router;
