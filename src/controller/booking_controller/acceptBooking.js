const BookingModel = require("../../model/booking_model");
const UserModel = require("../../model/user_model");
const NotificationModel = require("../../model/notification_model");

const acceptBooking = async (
  req,
  res
) => {
  try {
    const providerId = req.user.id;

    const { bookingId } = req.params;

    const booking =
      await BookingModel.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Booking already processed",
      });
    }

    booking.provider = providerId;

    booking.status = "Accepted";

    // Generate the OTP the customer will share with the provider
    // on arrival — required later by verifyOtp/startBooking.
    booking.otp = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    await booking.save();

    // Mark the provider Busy the moment they accept a job — this is
    // what keeps other customers from being able to send them a new
    // request while they're already committed to this one. They go
    // back to Online automatically when the job is completed or
    // cancelled (see completeBooking / cancelBooking).
    await UserModel.findByIdAndUpdate(
      providerId,
      {
        "providerDetails.availabilityStatus": "BUSY",
      }
    );

    // Re-populate before responding — after `booking.save()`,
    // `booking.customer`/`booking.provider` are still just bare
    // ObjectIds (customer was never populated to begin with, and we
    // just overwrote provider with a raw id above). Without this,
    // the frontend gets `customer: "64f..."` instead of
    // `customer: { name, mobile, avatar }`, so the OTP-accept toast
    // (and anything else reading booking.customer.mobile) silently
    // has no phone number to show.
    await booking.populate(
      "customer",
      "name email mobile avatar"
    );
    await booking.populate(
      "provider",
      "name email mobile avatar providerDetails"
    );

    await NotificationModel.create({
      receiver: booking.customer._id,
      receiverType: "user",
      sender: providerId,
      senderType: "serviceProvider",
      type: "PROVIDER_ACCEPTED",
      title: "Provider accepted your booking",
      message: `Your ${booking.service?.serviceName || "service"} booking has been accepted. Share OTP ${booking.otp} with the provider on arrival.`,
      booking: booking._id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message:
        "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

module.exports = acceptBooking;