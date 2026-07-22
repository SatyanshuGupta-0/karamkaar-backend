const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================
    // BASIC DETAILS
    // =====================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: null,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      default: "",
    },

    avatar: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: null,
      },
    },

    // =====================================
    // LOCATION
    // =====================================

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },

      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    // =====================================
    // ADDRESS
    // =====================================

    address: {
      fullAddress: {
        type: String,
        default: "",
      },

      houseNo: {
        type: String,
        default: "",
      },

      landmark: {
        type: String,
        default: "",
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

      country: {
        type: String,
        default: "India",
      },
    },
    language: {
      type: String,
      default: "English",
    },
    // =====================================
    // AUTH
    // =====================================

    verify_mobile: {
      type: Boolean,
      default: false,
    },

    verify_email: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: "",
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    access_token: {
      type: String,
      default: "",
    },

    refresh_token: {
      type: String,
      default: "",
    },

    // =====================================
    // ROLES
    // =====================================

    role: {
      type: [String],

      enum: [
        "USER",
        "PROVIDER",
        "ADMIN",
      ],

      default: ["USER"],
    },

    // =====================================
    // PROVIDER PROFILE
    // =====================================

    providerDetails: {
      isProvider: {
        type: Boolean,
        default: false,
      },

      description: {
        type: String,
        default: "",
      },

      experience: {
        type: Number,
        default: 0,
      },

      serviceRadius: {
        type: Number,
        default: 5,
      },

      availabilityStatus: {
        type: String,

        enum: [
          "ONLINE",
          "BUSY",
          "OFFLINE",
        ],

        default: "OFFLINE",
      },

      averageRating: {
        type: Number,
        default: 0,
      },

      totalReviews: {
        type: Number,
        default: 0,
      },

      totalCompletedJobs: {
        type: Number,
        default: 0,
      },

      totalEarnings: {
        type: Number,
        default: 0,
      },

      services: [
        {
          serviceName: {
            type: String,
            required: true,
          },

          category: {
            type: String,
            required: true,
          },

          keywords: {
            type: [String],
            default: [],
          },

          description: {
            type: String,
            default: "",
          },

          price: {
            type: Number,
            default: 0,
          },

          estimatedTime: {
            type: String,
            default: "",
          },

          isActive: {
            type: Boolean,
            default: true,
          },
        },
      ],
    },

    // =====================================
    // DOCUMENTS
    // =====================================

    documents: {
      aadhaarCard: {
        url: String,
        publicId: String,
      },

      drivingLicense: {
        url: String,
        publicId: String,
      },

      shopLicense: {
        url: String,
        publicId: String,
      },
    },

    // =====================================
    // BOOKINGS
    // =====================================

    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],

    activeBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    // =====================================
    // USER FEATURES
    // =====================================

    favoriteProviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    walletBalance: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    // =====================================
    // REVIEWS
    // =====================================

    reviewsGiven: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    reviewsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    // =====================================
    // NOTIFICATIONS
    // =====================================

    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],

    deviceTokens: [String],

    // =====================================
    // ACCOUNT STATUS
    // =====================================

    accountStatus: {
      type: String,

      enum: [
        "Active",
        "Inactive",
        "Blocked",
      ],

      default: "Active",
    },

    // =====================================
    // LOGIN
    // =====================================

    last_login_date: {
      type: Date,
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

userSchema.index({
  currentLocation: "2dsphere",
});

// =====================================
// MODEL
// =====================================

module.exports = mongoose.model(
  "User",
  userSchema
);