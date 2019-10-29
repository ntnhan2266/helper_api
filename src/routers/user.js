const express = require("express");

const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const router = new express.Router();
const CONSTANTS = require('../utils/constants');

router.post("/user/edit", authMiddleware, async (req, res) => {
  try {
    const requestUser = req.user;
    const user = await User.findById(requestUser._id);
    const body = req.body;
    user.name = body.name;
    user.email = body.email;
    user.gender = body.gender;
    user.phoneNumber = body.phoneNumber;
    user.long = body.long;
    user.lat = body.lat;
    user.address = body.address;
    user.birthday = Date.parse(body.birthday);
    user.avatar = body.avatar;
    await user.save();
    res.send({ user });
  } catch (e) {
    res.send({
      errorCode: 1,
      errorMessage: "Can not verify token"
    });
  }
});

router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const pageIndex = req.query.pageIndex * 1;
    const pageSize = req.query.pageSize * 1;
    const query = req.query.query;
    const projection = {
      name: 1,
      email: 1,
      gender: 1,
      birthday: 1,
      phoneNumber: 1,
      address: 1,
      isActive: 1
    };
    const users = await User.find(
      {
        $or: [
          { name: new RegExp(query, "i") },
          { email: new RegExp(query, "i") }
        ],
        role: CONSTANTS.ROLE.STANDARD
      },
      projection
    )
      .skip(pageIndex * pageSize)
      .limit(pageSize);
    const total = await User.countDocuments({
      $or: [
        { name: new RegExp(query, "i") },
        { email: new RegExp(query, "i") }
      ],
      role: CONSTANTS.ROLE.STANDARD
    });
    return res.send({ users, total });
  } catch (e) {
    console.log(e);
    return res.send({
      errorCode: 1,
      errorMessage: "Failed to load data"
    });
  }
});

router.put('/user/active', adminMiddleware, async (req, res) => {
  try {
    const id = req.body.id;
    const user = await User.findById(id);
    if (!user) {
      console.log('Can find user with id: ' + id);
      return res.send({
        errorCode: 1,
        errorMessage: "Can find user"
      });
    }
    user.isActive = true;
    await user.save();
    return res.send({ completed: true });
  } catch (e) {
    console.log(e);
    return res.send({
      errorCode: 1,
      errorMessage: "Can find user"
    });
  }
});

router.put('/user/deactive', adminMiddleware, async (req, res) => {
  try {
    const id = req.body.id;
    const user = await User.findById(id);
    if (!user) {
      console.log('Can find user with id: ' + id);
      return res.send({
        errorCode: 1,
        errorMessage: "Can find user"
      });
    }
    user.isActive = false;
    await user.save();
    return res.send({ completed: true });
  } catch (e) {
    console.log(e);
    return res.send({
      errorCode: 1,
      errorMessage: "Can find user"
    });
  }
});

module.exports = router;
