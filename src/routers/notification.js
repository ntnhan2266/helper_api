const express = require("express");
const router = new express.Router();

const Notification = require("../models/notification");
const authMiddleware = require("../middleware/auth");
const Constants = require("../utils/constants");


router.get("/notification", authMiddleware, async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? req.query.pageSize * 1 : 12;
    const pageIndex = req.query.pageIndex ? req.query.pageIndex * 1 : 0;
    const result = await Notification.find({
      toUser: req.user._id
    })
      .populate("booking", "-createdBy -maid")
      .populate("fromUser", "name")
      .sort({ createdAt: -1 })
      .skip(pageIndex * pageSize)
      .limit(pageSize);
    var notifications = Array.from(result, x => {
      var y = {};
      y.booking = x.booking;
      y.isRead = x.isRead;
      y.isHelper = x.isHelper;
      y.fromUser = x.fromUser.name;
      y.createdAt = x.createdAt;
      y.message = Constants.MESSAGE(x.status);
      return y;
    });
    res.send({ notifications });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not get notification"
    });
  }
});

router.get("/notification/read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ toUser: req.user._id }, { isRead: true });
    res.send({ success: true });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not read notification"
    });
  }
});

router.get("/notification/count", authMiddleware, async (req, res) => {
  try {
    const result = await Notification.countDocuments({ toUser: req.user._id, isRead: false });
    res.send({ count: result });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not count notification"
    });
  }
});

module.exports = router;
