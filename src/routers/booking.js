const admin = require("firebase-admin");
const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");

const User = require("../models/user");
const Category = require("../models/category");
const Notification = require("../models/notification");
const Booking = require("../models/booking");
const Transaction = require("../models/transaction");
const Maid = require("../models/maid");
const Interval = require("../models/interval");
const Setting = require("../models/setting");
const Constants = require("../utils/constants");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const email = require("../configs/email");
const utils = require("../utils/common");
const configs = require("../configs/configs");

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

const addNotification = async (booking, fromUser, toUser, status, isHelper) => {
  var notification = new Notification();
  notification.booking = booking;
  notification.fromUser = fromUser;
  notification.toUser = toUser;
  notification.status = booking.status;
  notification.isHelper = isHelper;
  await notification.save();

  const category = await Category.findById(booking.category);
  const fromUserObj = await User.findById(fromUser, "name");

  // send notification
  const querySnapshot = await admin
    .firestore()
    .collection("users")
    .doc(toUser + "")
    .collection("tokens")
    .get();
  const registrationTokens = querySnapshot.docs.map(doc => doc.id);
  var message = {
    notification: {
      title: "Smart Rabbit",
      body: "Smart Rabbit"
    },
    data: {
      category_vi: category.nameVi,
      category_en: category.nameEn,
      name: fromUserObj.name + "",
      message: Constants.MESSAGE(status)
    },
    tokens: registrationTokens
  };
  admin
    .messaging()
    .sendMulticast(message)
    .then(response => {
      console.log("Successfully sent message:", response);
    })
    .catch(error => {
      console.log("Error sending message:", error);
    });
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

    //send notification from user to helper
    addNotification(
      booking,
      booking.createdBy,
      maid.user,
      Constants.BOOKING_STATUS.WAITING_APPROVE,
      true
    );

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
      .populate("createdBy")
      .lean()
      .exec();
    const maid = await Maid.findById(booking.maid).populate("user");
    booking.maid = maid;
    booking.canReview = false;
    let completedAt = booking.completedAt;
    if (completedAt != null && !booking.isReviewed) {
      completedAt = moment(completedAt);
      const now = moment();
      let timeToReview = moment.duration(now.diff(completedAt)).asHours();
      // Get time to review as hours, default 72h
      const setting = await Setting.findOne();
      if (timeToReview < (setting.dayToReview) * 24) {
        booking.canReview = true;
      }
    }
    res.send({ booking });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not get booking"
    });
  }
});

router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    // Filter
    const status =
      req.query.status == Constants.BOOKING_STATUS.CANCELLED ||
        req.query.status == Constants.BOOKING_STATUS.REJECTED
        ? [
          Constants.BOOKING_STATUS.CANCELLED,
          Constants.BOOKING_STATUS.REJECTED
        ]
        : [req.query.status];
    const pageSize = req.query.pageSize ? req.query.pageSize * 1 : 12;
    const pageIndex = req.query.pageIndex ? req.query.pageIndex * 1 : 0;
    const requestUser = req.user;
    const bookings = await Booking.find({
      createdBy: requestUser._id,
      status: { $in: status }
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
    const status =
      req.query.status == Constants.BOOKING_STATUS.CANCELLED ||
        req.query.status == Constants.BOOKING_STATUS.REJECTED
        ? [
          Constants.BOOKING_STATUS.CANCELLED,
          Constants.BOOKING_STATUS.REJECTED
        ]
        : [req.query.status];
    const pageSize = req.query.pageSize ? req.query.pageSize : 12;
    const pageIndex = req.query.pageIndex ? req.query.pageIndex : 0;
    const requestUser = req.user;
    const maid = await Maid.findOne({ user: requestUser._id });
    const bookings = await Booking.find({
      maid: maid._id,
      status: { $in: status }
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

router.put("/booking/approve", authMiddleware, async (req, res) => {
  const bookingId = req.query.id;
  const requestUser = req.user;
  try {
    const maid = await Maid.findOne({ user: requestUser._id });
    const booking = await Booking.findOne({ maid: maid._id, _id: bookingId });
    // Has access
    // Approve
    booking.status = Constants.BOOKING_STATUS.APPROVED;
    await booking.save();

    //send notification from helper to user
    addNotification(
      booking,
      requestUser._id,
      booking.createdBy,
      Constants.BOOKING_STATUS.APPROVED,
      false
    );

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
    const booking = await Booking.findOne({ maid: maid._id, _id: bookingId })
      .populate("category")
      .populate("createdBy");
    // Has access
    // Approve
    booking.status = Constants.BOOKING_STATUS.COMPLETED;
    booking.completedAt = new Date();

    //send notification from helper to user
    addNotification(
      booking,
      requestUser._id,
      booking.createdBy._id,
      Constants.BOOKING_STATUS.COMPLETED,
      false
    );

    // Add transaction for this booking
    const transaction = new Transaction();
    transaction.booking = booking._id;
    transaction.amount = booking.amount;
    transaction.maid = booking.maid;
    transaction.user = booking.createdBy;
    transaction.category = booking.category;
    transaction.status = Constants.TRANSATION_STATUS.WAITING;
    await transaction.save();

    // Send email
    email.send({
      template: "complete-booking",
      message: {
        from: "Smart Rabbit <no-reply@smartrabbit.com>",
        to: booking.createdBy.email
      },
      locals: {
        name: booking.createdBy.name,
        category: booking.category.nameVi,
        phone: booking.createdBy.phoneNumber,
        amount: utils.formatCurrency(booking.amount, ""),
        transactionId: transaction._id,
        time: moment().format("DD/MM/YYYY HH:mm"),
        image_url: configs.IMG_HOST
      }
    });
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
    // const maid = await Maid.findOne({ user: requestUser._id });
    // const booking = await Booking.findOne({ maid: maid._id, _id: bookingId });
    const booking = await Booking.findOne({
      createdBy: requestUser._id,
      _id: bookingId
    }).populate("maid");
    // Has access
    // Approve
    booking.status = Constants.BOOKING_STATUS.CANCELLED;
    booking.reason = reason;
    booking.content = content;
    await booking.save();

    //send notification from user to helper
    addNotification(
      booking,
      booking.createdBy,
      booking.maid.user,
      Constants.BOOKING_STATUS.CANCELLED,
      true
    );

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
    booking.status = Constants.BOOKING_STATUS.REJECTED;
    booking.reason = reason;
    booking.content = content;

    //send notification from helper to user
    addNotification(
      booking,
      requestUser._id,
      booking.createdBy,
      Constants.BOOKING_STATUS.REJECTED,
      false
    );

    await booking.save();
    res.send({ completed: true });
  } catch (e) {
    console.log(e);
    res.status(401).send({ completed: false });
  }
});

router.get("/bookings/list", adminMiddleware, async (req, res) => {
  try {
    const pageIndex = req.query.pageIndex * 1;
    const pageSize = req.query.pageSize * 1;
    const filterBy = req.query.filterBy;
    const queryId = req.query.queryId;
    const type = req.query.type;
    let filter = {};
    if (filterBy == "helper" && queryId) {
      filter = { maid: queryId };
    } else if (queryId) {
      filter = { createdBy: queryId };
    }
    if (type) {
      filter.status = type;
    }
    const bookings = await Booking.find(filter)
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
    const total = await Booking.countDocuments(filter);
    return res.send({ bookings, total });
  } catch (e) {
    console.log(e);
    return res.send({
      errorCode: 1,
      errorMessage: "Failed to load data"
    });
  }
});

router.put("/booking/admin-cancel", adminMiddleware, async (req, res) => {
  const bookingId = req.body.id;
  const reason = 5;
  const content = req.body.content;
  try {
    const booking = await Booking.findOne({ _id: bookingId });
    // Has access
    // Approve
    booking.status = Constants.BOOKING_STATUS.CANCELLED;
    booking.reason = reason;
    booking.content = content;
    await booking.save();
    res.send({ completed: true });
  } catch (e) {
    console.log(e);
    res.status(401).send({ completed: false });
  }
});

getDateString = (date) => {
  const newDate = new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString();
  return newDate.substr(0, newDate.indexOf('T'));
}

getTimeString = (time) => {
  const date = new Date(time.getTime() + 7 * 60 * 60 * 1000).toISOString();
  const newTime = date.substr(date.indexOf('T') + 1, 5);
  return newTime;
}

router.get("/bookings/calendar", authMiddleware, async (req, res) => {
  try {
    // Filter
    const requestUser = req.user;
    const from = req.query.from;
    const to = req.query.to;
    const fromDate = new Date(from + " 00:00:00.000");
    const toDate = new Date(to + " 00:00:00.000");
    console.log(from);
    console.log(to);
    console.log(fromDate);
    console.log(toDate);
    const bookings = await Booking.find({
      $or: [
        { createdBy: requestUser._id },
        { maid: requestUser._id },
      ],
      $or: [
        {
          $and: [
            { startDate: { $gte: fromDate } },
            { startDate: { $lte: toDate } },
          ]
        },
        {
          $and: [
            { startDate: { $lte: toDate } },
            { endDate: { $gte: fromDate } },
          ]
        }
      ],
      status: Constants.BOOKING_STATUS.APPROVED,
    }).populate("interval category");
    var calendar = {};
    bookings.forEach(booking => {
      var data = {
        user: booking.createdBy,
        helper: booking.maid,
        categoryVi: booking.category.nameVi,
        categoryEn: booking.category.nameEn,
        address: booking.address,
        startTime: getTimeString(booking.startTime),
        endTime: getTimeString(booking.endTime),
      };
      if (booking.interval) {
        var dates = booking.interval.days || [];
        dates.forEach(datetime => {
          const date = datetime.toISOString().substr(0, 10);
          calendar[date] = [...(calendar[date] || []), data];
        })
      } else {
        var date = getDateString(booking.startDate);
        calendar[date] = [...(calendar[date] || []), data];
      }
    });
    console.log(calendar);
    res.send({ calendar });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Failed to load data"
    });
  }
});

module.exports = router;
