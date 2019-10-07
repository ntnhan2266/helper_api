const express = require("express");

const Booking = require("../models/booking");
const Review = require("../models/booking");
const Utils = require("../utils/common");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

router.post("/booking", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const booking = new Booking();
    booking.type = body.type;
    booking.category = body.category;
    booking.address = body.address;
    booking.houseNumber = body.houseNumber; 
    booking.startTime = new Date(body.startTime);
    booking.endTime = new Date(body.endTime);
    booking.note = body.note;
    booking.lat = body.lat;
    booking.long = body.long;
    booking.startDate = new Date(body.startDate);
    booking.endDate = new Date(body.endDate);
    booking.maid = body.maid;
    booking.createdBy = req.user._id;
    const maid = await Maid.findById(body.maid);
    let amount = calculateAmount(
      body.type,
      body.workingDates,
      body.startTime,
      body.endTime,
      maid.salary
    );
    booking.amount = amount;
    // Have interval
    if (body.type == 2) {
      const interval = new Interval();
      const days = [];
      for (let i = 0; i < body.workingDates.length; i++) {
        days.push(new Date(body.workingDates[i]));
      }
      interval.days = days;
      interval.options = body.interval;
      await interval.save();
      booking.interval = interval.id;
    }
    await booking.save();
    res.send({ booking });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not create booking"
    });
  }
});

module.exports = router;
