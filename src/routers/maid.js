const express = require("express");

const Maid = require("../models/maid");
const authMiddleware = require("../middleware/auth");
const router = new express.Router();

router.get("/maid", authMiddleware, async (req, res) => {
  try {
    const requestUser = req.user;
    const maid = await Maid.findOne({ user: requestUser._id });
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
    console.log(body);
    const maid = new Maid({
      user: requestUser._id,
      intro: body.intro,
      literacyType: body.literacyType,
      exp: body.exp,
      salaryType: body.salaryType,
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
    maid.salaryType = body.salaryType;
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

module.exports = router;
