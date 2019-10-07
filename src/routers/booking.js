const express = require("express");

const Booking = require("../models/booking");
const Maid = require("../models/maid");
const Interval = require("../models/interval");
const CancelledBooking = require("../models/cancelled_booking");
const Utils = require("../utils/common");
const Contants = require("../utils/constants");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();
var mongoose = require("mongoose");
var _ = require("lodash");

const calculateAmount = (type, interval, startTime, endTime, salaryPerHour) => {
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

router.get("/booking", authMiddleware, async (req, res) => {
  try {
    const id = req.query.id;
    const booking = await Booking.findById(id)
      .populate("interval")
      .populate("createdBy");
    const maid = await Maid.findById(booking.maid).populate("user");
    booking.maid = maid;
    res.send({ booking });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not create booking"
    });
  }
});

router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    // Filter
    const status = req.query.status;
    console.log(status);
    const pageSize = req.query.pageSize ? req.query.pageSize : 12;
    const pageIndex = req.query.pageIndex ? req.query.pageIndex : 0;
    const requestUser = req.user;
    const bookings = await Booking.find({
      createdBy: requestUser._id,
      status: status
    })
      .populate("createdBy")
      .skip(pageIndex * pageSize)
      .limit(pageSize);
    const maidIds = bookings.map(booking => {
      return mongoose.Types.ObjectId(booking.maid);
    });
    let maids = await Maid.find({ _id: { $in: maidIds } }).populate({
      path: "user",
      select: "name avatar birthday gender phoneNumber address"
    });
    maids = _.keyBy(maids, "_id");
    for (let i = 0; i < bookings.length; i++) {
      if (maids[bookings[i].maid]) {
        bookings[i].maid = maids[bookings[i].maid];
      }
    }
    const total = await Booking.countDocuments({
      createdBy: requestUser._id,
      status: status
    });
    res.send({ bookings, total });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Failed to load data"
    });
  }
});

router.get("/bookings/host", authMiddleware, async (req, res) => {
  try {
    // Filter
    const status = req.query.status;
    const pageSize = req.query.pageSize ? req.query.pageSize : 12;
    const pageIndex = req.query.pageIndex ? req.query.pageIndex : 0;
    const requestUser = req.user;
    const maid = await Maid.findOne({ user: requestUser._id });
    const bookings = await Booking.find({ maid: maid._id, status: status })
      .populate("createdBy")
      .skip(pageIndex * pageSize)
      .limit(pageSize);
    const maidIds = bookings.map(booking => {
      return mongoose.Types.ObjectId(booking.maid);
    });
    let maids = await Maid.find({ _id: { $in: maidIds } }).populate({
      path: "user",
      select: "name avatar birthday gender phoneNumber address"
    });
    maids = _.keyBy(maids, "_id");
    for (let i = 0; i < bookings.length; i++) {
      if (maids[bookings[i].maid]) {
        bookings[i].maid = maids[bookings[i].maid];
      }
    }
    const total = await Booking.countDocuments({
      createdBy: requestUser._id,
      status: status
    });
    res.send({ bookings, total });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Failed to load data"
    });
  }
});

router.put("/booking/approve", authMiddleware, async (req, res) => {
  const bookingId = req.query.id;
  const requestUser = req.user;
  try {
    const maid = await Maid.findOne({ user: requestUser._id });
    const booking = await Booking.findOne({ maid: maid._id, _id: bookingId });
    // Has access
    // Approve
    booking.status = Contants.BOOKING_STATUS.APPROVED;
    await booking.save();
    res.send({ completed: true });
  } catch (e) {
    console.log(e);
    res.status(401).send({ completed: false });
  }
});

router.put("/booking/complete", authMiddleware, async (req, res) => {
  const bookingId = req.query.id;
  const requestUser = req.user;
  try {
    const maid = await Maid.findOne({ user: requestUser._id });
    const booking = await Booking.findOne({ maid: maid._id, _id: bookingId });
    // Has access
    // Approve
    booking.status = Contants.BOOKING_STATUS.COMPLETED;
    await booking.save();
    res.send({ completed: true });
  } catch (e) {
    console.log(e);
    res.status(401).send({ completed: false });
  }
});

router.post("/booking/cancel", authMiddleware, async (req, res) => {
  const bookingId = req.body.id;
  const reason = req.body.reason;
  const content = req.body.content;
  const requestUser = req.user;
  try {
    const maid = await Maid.findOne({ user: requestUser._id });
    const booking = await Booking.findOne({ maid: maid._id, _id: bookingId });
    // Has access
    // Approve
    booking.status = Contants.BOOKING_STATUS.CANCELLED;
    const cancelledBooking = new CancelledBooking();
    cancelledBooking.booking = booking._id;
    cancelledBooking.reason = reason;
    cancelledBooking.content = content;
    await cancelledBooking.save();
    await booking.save();
    res.send({ completed: true });
  } catch (e) {
    console.log(e);
    res.status(401).send({ completed: false });
  }
});

router.post("/booking/reject", authMiddleware, async (req, res) => {
  const bookingId = req.body.id;
  const reason = req.body.reason;
  const content = req.body.content;
  const requestUser = req.user;
  try {
    const maid = await Maid.findOne({ user: requestUser._id });
    const booking = await Booking.findOne({ maid: maid._id, _id: bookingId });
    // Has access
    // Approve
    booking.status = Contants.BOOKING_STATUS.REJECTED;
    const cancelledBooking = new CancelledBooking();
    cancelledBooking.booking = booking._id;
    cancelledBooking.reason = reason;
    cancelledBooking.content = content;
    await cancelledBooking.save();
    await booking.save();
    res.send({ completed: true });
  } catch (e) {
    console.log(e);
    res.status(401).send({ completed: false });
  }
});

module.exports = router;
