const express = require("express");
const router = new express.Router();

const email = require("../configs/email");
const configs = require("../configs/configs");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/auth");
const Setting = require("../models/setting");

router.post("/invite/email", authMiddleware, async (req, res) => {
  try {
    const user = req.user.name;
    const emailAddr = req.body.email;
    // Send email
    email.send({
      template: "app-invitation",
      message: {
        from: "Smart Rabbit <no-reply@smartrabbit.com>",
        to: emailAddr
      },
      locals: {
        name: user,
        image_url: configs.IMG_HOST
      }
    });
    res.send({ completed: true });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not send email"
    });
  }
});

router.get("/settings", adminMiddleware, async (req, res) => {
  try {
    const setting = await Setting.findOne();
    res.send({ setting });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not get data"
    });
  }
});

router.put("/setting/day-to-review", adminMiddleware, async (req, res) => {
  try {
    const id = req.body.id;
    const days = req.body.days;
    const setting = Setting.findById(id);
    setting.daysToReview = days;
    await setting.save();
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not edit data"
    });
  }
});

module.exports = router;
