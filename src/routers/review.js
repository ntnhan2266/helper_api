const express = require("express");

const Review = require("../models/booking");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

router.post("/review", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const review = new Review();
    res.send({ review });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not create review"
    });
  }
});

module.exports = router;
