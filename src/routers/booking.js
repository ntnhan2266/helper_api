const express = require("express");

const Booking = require("../models/booking");
const Maid = require("../models/maid");
const Interval = require("../models/interval");
const Utils = require("../utils/common");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();
var mongoose = require('mongoose');

const calculateAmount = (
  type,
  interval,
  startTime,
  endTime,
  salaryPerHour
) => {
  let price = 0;
  // Calculate diff time
  const diffTime = Math.abs(Date.parse(endTime) - Date.parse(startTime));
  const hours = Math.ceil(diffTime / (1000 * 60 * 60));
  if (type == 1) {
    price = hours * salaryPerHour;
  } else {
    // Calculate diff dates
    let days = interval.length;
    price = hours * salaryPerHour * days;
  }
  return price;
};

router.post("/booking", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const booking = new Booking();
    booking.type = body.type;
    booking.address = body.address;
    booking.houseNumber = body.houseNumber;
    booking.startTime = Date(body.startTime);
    booking.endTime = Date(body.endTime);
    booking.note = body.note;
    booking.lat = body.lat;
    booking.long = body.long;
    booking.startDate = Date(body.startDate);
    booking.endDate = Date(body.endDate);
    booking.maid = body.maid;
    booking.createdBy = req.user._id;
    const maid = await Maid.findById(body.maid);
    let amount = calculateAmount(
      body.type,
      body.interval,
      body.startTime,
      body.endTime,
      maid.salary
    );
    booking.amount = amount;
    // Have interval
    if (body.type == 2) {
      const interval = new Interval();
      const days = [];
      for (let i = 0; i < body.interval.length; i++) {
        days.push(new Date(body.interval[i]));
      }
      interval.days = days;
      await interval.save();
      body.interval = interval.id;
    }
    await booking.save();
    console.log(booking.amount);
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
