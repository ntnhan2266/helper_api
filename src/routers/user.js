const express = require("express");

const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const router = new express.Router();

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

router.get("/users", async (req, res) => {
  try {
    const pageIndex = req.query.pageIndex * 1;
    const pageSize = req.query.pageSize * 1;
    const query = req.query.query;
    const projection = {
      _id: 0,
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
        ]
      },
      projection
    )
      .skip(pageIndex * pageSize)
      .limit(pageSize);
    const total = await User.countDocuments({
      $or: [
        { name: new RegExp("^" + query + "$", "i") },
        { email: new RegExp("^" + query + "$", "i") }
      ]
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

module.exports = router;
