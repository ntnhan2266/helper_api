const express = require("express");

const Maid = require("../models/maid");
const Review = require('../models/review');
const authMiddleware = require("../middleware/auth");
const router = new express.Router();
const _ = require('lodash');

router.get("/maid", authMiddleware, async (req, res) => {
  try {
    let maid;
    const id = req.query.id;
    if (id) {
      maid = await Maid.findById(id).populate({
        path: "user",
        select: "name avatar birthday gender phoneNumber address"
      });;
    } else {
      const requestUser = req.user;
      maid = await Maid.findOne({ user: requestUser._id }).populate({
        path: "user",
        select: "name avatar birthday gender phoneNumber address"
      });
    }
    res.send({ maid, isHost: true });
  } catch (e) {
    console.log(e);
    res.send({ isHost: false, maid: null });
  }
});

router.post("/maid", authMiddleware, async (req, res) => {
  try {
    const requestUser = req.user;
    const body = req.body;
    const maid = new Maid({
      user: requestUser._id,
      intro: body.intro,
      literacyType: body.literacyType,
      exp: body.exp,
      salary: body.salary,
      jobTypes: body.jobTypes,
      supportAreas: body.supportAreas
    });
    await maid.save();
    res.send({ maid, isHost: true });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Unexpected errors"
    });
  }
});

router.post("/maid/edit", authMiddleware, async (req, res) => {
  try {
    const requestUser = req.user;
    const body = req.body;
    const maid = await Maid.findOne({ user: requestUser._id });
    maid.intro = body.intro;
    maid.literacyType = body.literacyType;
    maid.exp = body.exp;
    maid.salary = body.salary;
    maid.jobTypes = body.jobTypes;
    maid.supportAreas = body.supportAreas;
    await maid.save();
    res.send({ maid, isHost: true });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Unexpected errors"
    });
  }
});

router.get("/maids", async (req, res) => {
  try {
    const page = req.query.pageIndex ? req.query.pageIndex : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize : 10;
    const maids = await Maid.find({}, null, { skip: page * pageSize, limit: pageSize }).populate({
      path: "user",
      select: "name avatar birthday gender phoneNumber address"
    });
    const total = await Maid.countDocuments({});
    res.send({ maids, total });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Unexpected errors"
    });
  }
});

router.get("/maids/top-rating", authMiddleware, async (req, res) => {
  try {
    const page = req.query.pageIndex ? req.query.pageIndex : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize : 10;
    const reviews = await Review.aggregate([
      {
        $group: {
          _id: '$user',
          avgRating: { $avg: '$rating' }
        },
      },
      {
        $sort: { avgRating: -1 }
      },
      {
        $limit: pageSize
      }
    ]);
    console.log(reviews);
    const maids = await Maid.find({}, null, { skip: page * pageSize, limit: pageSize }).populate({
      path: "user",
      select: "name avatar birthday gender phoneNumber address"
    });
    const total = await Maid.countDocuments({});
    res.send({ maids, total });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Unexpected errors"
    });
  }
});

module.exports = router;
