const mongoose = require("mongoose");

const cancelledBookingSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      unique: true
    },
    reason: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

const CancelledBooking = mongoose.model(
  "CancelledBooking",
  cancelledBookingSchema
);

module.exports = CancelledBooking;
