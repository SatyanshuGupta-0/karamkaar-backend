const createBooking = require("./createBooking");
const getMyBookings = require("./getMyBookings");
const getProviderBookings = require("./getProviderBookings");
const getBookingDetails = require("./getBookingDetails");
const acceptBooking = require("./acceptBooking");
const rejectBooking = require("./rejectBooking");
const startBooking = require("./startBookings");
const completeBooking = require("./completeBooking");
const cancelBooking = require("./cancelBooking");
const deleteBooking = require("./deleteBooking");
const verifyOtp = require("./verifyOtp");
const updateBookingLocation = require("./updateBookingLocation");

module.exports = {
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
};
