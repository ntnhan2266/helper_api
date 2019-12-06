const express = require("express");
const router = new express.Router();

const email = require("../configs/email");
const configs = require('../configs/configs');
const authMiddleware = require("../middleware/auth");

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

module.exports = router;
