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
    let transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '16198c947548f6',
        pass: '592dd89e1e2080'
      }
    });
    const message = {
      from: 'smart-rabit@app.com',
      to: email,
      subject: 'Invitation',
      text: `${user} invite you to Smart Rabbit. Install the app now!!!`
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
