const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createReview,
  getServiceProviderReviews,
  deleteReview,
} = require("../controller/review_controller");

// ==========================================
// CREATE REVIEW
// ==========================================

router.post(
  "/create",
  auth,
  createReview
);

// ==========================================
// GET ALL REVIEWS OF PROVIDER
// ==========================================

router.get(
  "/provider/:providerId",
  getServiceProviderReviews
);

// ==========================================
// DELETE REVIEW
// ==========================================

router.delete(
  "/:reviewId",
  auth,
  deleteReview
);

module.exports = router;