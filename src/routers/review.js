const express = require("express");

const Review = require("../models/review");
const Booking = require("../models/booking");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

router.post("/review", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const review = new Review();
    review.rating = body.rating;
    review.content = body.content;
    review.maid = body.maidId;
    review.booking = body.bookingId;
    review.createdBy = req.user._id;
    const booking = await Booking.findById(body.bookingId);
    booking.isReviewed = true;
    await booking.save();
    await review.save();
    res.send({ review });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not create review"
    });
  }
});

router.get('/reviews', authMiddleware, async (req, res) => {
  
});

module.exports = router;
