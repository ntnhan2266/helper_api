const express = require("express");

const Review = require("../models/review");
const Maid = require('../models/maid')
const Booking = require("../models/booking");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const router = new express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");

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
  try {
    const pageSize = req.query.pageSize * 1 || 10;
    const pageIndex = req.query.pageIndex * 1 || 0;
    const maidId = req.query.maidId;
    const reviews = await Review.find({ maid: mongoose.Types.ObjectId(maidId) })
      .populate('createdBy')
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort([['createdAt', -1]]).lean().exec();
    const maidIds = reviews.map(review => {
      return mongoose.Types.ObjectId(review.maid);
    });
    let maids = await Maid.find({ _id: { $in: maidIds } }).populate({
      path: "user",
      select: "name avatar birthday gender phoneNumber address"
    });
    maids = _.keyBy(maids, "_id");
    for (let i = 0; i < reviews.length; i++) {
      if (maids[reviews[i].maid]) {
        reviews[i].maid = maids[reviews[i].maid];
      }
    }
    const total = await Review.countDocuments({ maid: mongoose.Types.ObjectId(maidId) });
    res.send({ reviews, total });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Something went wrong"
    });
  }
});

router.get('/reviews/list', adminMiddleware, async (req, res) => {
  try {
    const pageSize = req.query.pageSize * 1 || 10;
    const pageIndex = req.query.pageIndex * 1 || 0;
    const reviews = await Review.find({})
      .populate('createdBy')
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort([['createdAt', -1]]).lean().exec();
    const total = await Review.countDocuments({});
    res.send({ reviews, total });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Something went wrong"
    });
  }
});

r

module.exports = router;
