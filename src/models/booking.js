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
      type: Map,
      of: Boolean,
      required: false
    },
    workingFee: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
