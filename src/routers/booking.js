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
    booking.category = body.category;
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

router.get('/booking', authMiddleware, async (req, res) => {
  try {
    const id = req.query.id;
    const booking = await Booking.findById(id).populate('interval');
    const maid = await Maid.findById(booking.maid).populate('user');
    booking.maid = maid;
    res.send({booking});
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not create booking"
    });
  }
});

router.get('/bookings', authMiddleware, async (req, res) => {
  try {
  // Filter
  const type = req.query.type;
  const pageSize = req.query.pageSize ? req.query.pageSize : 12;
  const pageIndex = req.query.pageIndex ? req.query.pageIndex : 0;
  const requestUser = req.user;
  const bookings = await Booking.find({createdBy: requestUser.id}, {skip: pageIndex * pageSize, limit: pageSize});
  res.send({bookings});
  } catch(e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Failed to load data"
    });
  }
});

module.exports = router;
