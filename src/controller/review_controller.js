const ReviewModel = require("../model/review_model");
const BookingModel = require("../model/booking_model");
const UserModel = require("../model/user_model");
const NotificationModel = require("../model/notification_model");

// =====================================
// Recalculate and persist a provider's average rating
// =====================================

const refreshProviderRating = async (providerId) => {
  const reviews = await ReviewModel.find({
    provider: providerId,
  });

  const totalReviews = reviews.length;

  const averageRating = totalReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  await UserModel.findByIdAndUpdate(providerId, {
    "providerDetails.averageRating": Number(
      averageRating.toFixed(1)
    ),
    "providerDetails.totalReviews": totalReviews,
  });
};

// =====================================
// CREATE REVIEW
// =====================================

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Frontend sends `bookingId` — accept both names so nothing
    // breaks if either side changes field naming later.
    const { booking, bookingId, rating, review } = req.body;
    const bookingRef = booking || bookingId;

    if (!bookingRef || !rating) {
      return res.status(400).json({
        success: false,
        message: "booking and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // =====================================
    // VALIDATE BOOKING
    // =====================================

    const bookingData = await BookingModel.findById(bookingRef);

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (bookingData.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings",
      });
    }

    if (bookingData.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed bookings",
      });
    }

    if (!bookingData.provider) {
      return res.status(400).json({
        success: false,
        message: "This booking has no assigned provider to review",
      });
    }

    // =====================================
    // PREVENT DUPLICATE REVIEW
    // =====================================

    const alreadyReviewed = await ReviewModel.findOne({
      booking: bookingRef,
      user: userId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted for this booking",
      });
    }

    // =====================================
    // CREATE REVIEW
    // =====================================

    const newReview = await ReviewModel.create({
      booking: bookingRef,
      user: userId,
      provider: bookingData.provider,
      rating,
      review: review || "",
    });

    // link back on the booking
    bookingData.review = newReview._id;
    bookingData.rating = rating;
    await bookingData.save();

    // =====================================
    // UPDATE PROVIDER'S AVERAGE RATING
    // =====================================

    await refreshProviderRating(bookingData.provider);

    // =====================================
    // NOTIFY THE PROVIDER
    // =====================================

    const reviewer = await UserModel.findById(userId).select("name");

    await NotificationModel.create({
      receiver: bookingData.provider,
      receiverType: "serviceProvider",
      sender: userId,
      senderType: "user",
      type: "REVIEW",
      providerId: bookingData.provider,
      title: "New review",
      message: `${reviewer?.name || "A customer"} left you a ${rating}-star review${
        review ? `: "${review}"` : "."
      }`,
      booking: bookingData._id,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// =====================================
// GET ALL REVIEWS FOR A PROVIDER
// =====================================

const getServiceProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await ReviewModel.find({
      provider: providerId,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// DELETE REVIEW
// =====================================

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await ReviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const providerId = review.provider;

    await ReviewModel.findByIdAndDelete(reviewId);

    await refreshProviderRating(providerId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getServiceProviderReviews,
  deleteReview,
};
