const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      receiver: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      receiverType: {
        type: String,
        enum: ["user", "serviceProvider"],
        default: "user",
      },

      sender: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      senderType: {
        type: String,
        default: "system",
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        default: "GENERAL",
      },

      booking: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
      },

      // Lets notification types like REVIEW / PROVIDER_AVAILABLE
      // link back to a provider's page even when there's no
      // associated booking to derive it from.
      providerId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      isRead: {
        type: Boolean,
        default: false,
      },

      readAt: {
        type: Date,
        default: null,
      },

      isDeleted: {
        type: Boolean,
        default: false,
      },

      image: {
        type: String,
        default: "",
      },

      redirectUrl: {
        type: String,
        default: "",
      },

      screen: {
        type: String,
        default: "",
      },

      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);