const express = require("express");

const Notification = require("../models/notification");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();


router.get("/notification", authMiddleware, async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? req.query.pageSize * 1 : 12;
    const pageIndex = req.query.pageIndex ? req.query.pageIndex * 1 : 0;
    const notifications = await Notification.find({
      toUser: req.user._id
    })
      .populate("booking", '-createdBy -maid')
      .populate("fromUser")
      .sort({ updatedAt: -1 })
      .skip(pageIndex * pageSize)
      .limit(pageSize);
    res.send({ notifications });
  } catch (e) {
    res.send({
      errorCode: 1,
      errorMessage: "Can not get notification"
    });
  }
});

module.exports = router;
