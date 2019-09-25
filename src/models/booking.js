const mongoose = require("mongoose");
const validator = require("validator");

const bookingSchema = new mongoose.Schema(
  {
    type: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    houseNumber: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: false
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    note: {
      type: String,
      required: false
    },
    lat: {
      type: Number,
      required: true
    },
    long: {
      type: Number,
      required: true
    },
    maid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maid"
    },
    interval: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interval",
      required: false,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
