const express = require("express");
const nodemailer = require('nodemailer');

const authMiddleware = require("../middleware/auth");
const router = new express.Router();

router.post("/invite/email", authMiddleware, async (req, res) => {
  try {
    const user = req.user.name;
    console.log(user);
    const email = req.body.email;
    console.log(email);
    var transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'smart.rabbit.app@gmail.com',
        pass: '12ba456789'
      }
    });
    const message = {
      from: 'Smart Rabbit',
      to: email,
      subject: 'Invitation',
      html: `<p><b>${user}</b> invite you to <b>Smart Rabbit</b>. Install the app now!!!</p>`
    };
    transport.sendMail(message, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log(info);
      }
    });
    res.send({});
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can send email"
    });
  }
});

module.exports = router;
