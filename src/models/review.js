const mongoose = require("mongoose");
const validator = require("validator");

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    content: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 1000
    },
    rating: {
      type: Number,
      required: true,
      validate: val => {
        if (val < 1 || val > 5) {
          throw new Error("Invalid rating");
        }
      }
    },
    maid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maid",
      required: true
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
