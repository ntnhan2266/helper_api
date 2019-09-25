const express = require("express");

const Booking = require("../models/maid");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();

router.post('/booking', authMiddleware, async (req, res) => {
  console.log(req.body)
  res.send({data: 'ok'});
});

module.exports = router;