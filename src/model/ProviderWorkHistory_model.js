const mongoose = require("mongoose");

const jobReportSchema =
  new mongoose.Schema(
    {
      booking: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },

      provider: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      materialsUsed: [
        {
          itemName: String,
          quantity: Number,
          price: Number,
        },
      ],

      labourCharge: {
        type: Number,
        default: 0,
      },

      totalAmount: {
        type: Number,
        default: 0,
      },

      notes: String,
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "JobReport",
  jobReportSchema
);