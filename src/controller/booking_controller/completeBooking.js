const BookingModel = require("../../model/booking_model");
const UserModel = require("../../model/user_model");
const NotificationModel = require("../../model/notification_model");

const completeBooking = async (
  req,
  res
) => {
  try {
    const providerId = req.user.id;

    const { bookingId } = req.params;

    const {
      paymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    if (
      !paymentMethod ||
      !["Cash", "Online"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "paymentMethod must be 'Cash' or 'Online'",
      });
    }

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

    if (
      booking.provider?.toString() !==
      providerId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already marked completed",
      });
    }

    if (
      booking.status === "Cancelled" ||
      booking.status === "Rejected"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot complete a cancelled/rejected booking",
      });
    }

    // Whatever the provider actually collected — this is the single
    // source of truth from here on. Everywhere else in the app
    // (dashboards, history, invoices) reads this same field, so
    // there's nothing else to keep in sync.
    booking.paymentMethod = paymentMethod;
    booking.status = "Completed";
    booking.completedAt = new Date();

    if (paymentMethod === "Online") {
      booking.paymentDetails = {
        razorpayPaymentId: razorpayPaymentId || undefined,
        razorpayOrderId: razorpayOrderId || undefined,
        razorpaySignature: razorpaySignature || undefined,
      };
    }

    await booking.save();

    // Job's done — free the provider up for new requests again. This
    // is the other half of the Busy flip in acceptBooking: Busy the
    // moment they accept, back to Online the moment they finish.
    await UserModel.findByIdAndUpdate(
      providerId,
      {
        "providerDetails.availabilityStatus": "ONLINE",
      }
    );

    // Re-populate before responding — same reasoning as
    // acceptBooking: after save(), customer/provider are still bare
    // ObjectIds, and every screen reading booking.customer.mobile /
    // booking.provider.name off this response would otherwise get
    // nothing back.
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
      type: "BOOKING_COMPLETED",
      title: "Service completed",
      message: `Your ${booking.service?.serviceName || "service"} booking is marked completed. Payment method: ${paymentMethod}.`,
      booking: booking._id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message:
        "Booking marked completed successfully",
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

module.exports = completeBooking;