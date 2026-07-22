const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // =====================================
    // CUSTOMER
    // =====================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },

    customerDetails: {
      name: String,
      mobile: String,
    },

    // =====================================
    // PROVIDER
    // =====================================

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    providerDetails: {
      name: String,
      mobile: String,
    },

    // =====================================
    // SERVICE DETAILS
    // =====================================

    service: {
      serviceName: {
        type: String,
        // required: true,
      },

      category: {
        type: String,
        // required: true,
      },

      price: {
        type: Number,
        default: 0,
      },

      estimatedTime: {
        type: String,
        default: "",
      },
    },

    // =====================================
    // BOOKING ID
    // =====================================

    bookingId: {
      type: String,
      // unique: true,
    },

    // =====================================
    // PROBLEM DETAILS
    // =====================================

    problemDescription: {
      type: String,
      default: "",
    },

    images: [
      {
        url: String,
        publicId: String,
      },
    ],

    // =====================================
    // CUSTOMER ADDRESS
    // =====================================

    address: {
      fullAddress: {
        type: String,
        // required: true,
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },

      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number], // [longitude, latitude]
          // required: true,
        },
      },
    },

    // =====================================
    // DATE & TIME
    // =====================================

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // =====================================
    // STATUS
    // =====================================

    status: {
      type: String,

      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "OnTheWay",
        "Started",
        "Completed",
        "Cancelled",
      ],

      default: "Pending",
    },

    // =====================================
    // OTP VERIFICATION
    // =====================================

    otp: {
      type: String,
      default: "",
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    // =====================================
    // MATERIALS USED
    // =====================================

    materialsUsed: [
      {
        itemName: String,

        quantity: {
          type: Number,
          default: 1,
        },

        unitPrice: {
          type: Number,
          default: 0,
        },

        totalPrice: {
          type: Number,
          default: 0,
        },
      },
    ],

    // =====================================
    // BILLING
    // =====================================

    servicePrice: {
      type: Number,
      default: 0,
    },

    materialCost: {
      type: Number,
      default: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    // =====================================
    // PAYMENT
    // =====================================

    paymentMethod: {
      type: String,

      enum: [
        "COD",
        "Online",
        "Wallet",
      ],

      default: "COD",
    },

    paymentStatus: {
      type: String,

      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],

      default: "Pending",
    },

    transactionId: {
      type: String,
      default: "",
    },

    // =====================================
    // LIVE TRACKING
    // =====================================

    providerLiveLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },

      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    // =====================================
    // NOTES
    // =====================================

    customerNote: {
      type: String,
      default: "",
    },

    providerNote: {
      type: String,
      default: "",
    },

    cancelReason: {
      type: String,
      default: "",
    },

    // =====================================
    // REVIEW
    // =====================================

    rating: {
      type: Number,
      default: 0,
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================
// GEO INDEX
// =====================================

bookingSchema.index({
  "address.location": "2dsphere",
});

// =====================================
// AUTO BOOKING ID
// =====================================

bookingSchema.pre("save", async function () {
  if (!this.bookingId) {
    this.bookingId = "BOOK-" + Date.now();
  }
});

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);