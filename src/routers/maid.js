const express = require("express");
const router = new express.Router();
const _ = require("lodash");

const Maid = require("../models/maid");
const Review = require("../models/review");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const CONSTANTS = require("../utils/constants");
var ObjectId = require('mongoose').Types.ObjectId;

router.get("/maid", authMiddleware, async (req, res) => {
  try {
    let maid;
    const id = req.query.id;
    if (id) {
      maid = await Maid.findById(id).populate({
        path: "user",
        select: "name avatar birthday gender phoneNumber address"
      });
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

router.get("/maids", authMiddleware, async (req, res) => {
  try {
    const page = req.query.pageIndex ? req.query.pageIndex * 1 : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize * 1 : 10;
    const query = req.query.query;
    const tempMaids = await Maid.find({ active: true }, null, {
      skip: page * pageSize,
      limit: pageSize
    })
      .populate({
        path: "user",
        select: "name email avatar birthday gender phoneNumber address",
        match: {
          $or: [
            { name: new RegExp(query, "i") },
            { email: new RegExp(query, "i") }
          ],
          role: CONSTANTS.ROLE.STANDARD,
        },
        options: {
          retainNullValues: false
        }
      })
      .populate("jobTypes");
    let maids = [];
    for (const maid of tempMaids) {
      if (maid.user) {
        maids.push(maid);
      }
    }
    const total = maids.length;
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
    const maids = await Maid.find({
      ratting: { $gte: 4 }
    }, null, {
      skip: page * pageSize,
      limit: pageSize,
      sort: { ratting: -1 }
    }).populate({
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

router.get("/maid/list", authMiddleware, async (req, res) => {
  try {
    const page = req.query.pageIndex ? req.query.pageIndex * 1 : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize * 1 : 10;
    const query = req.query.query;
    const tempMaids = await Maid.find({}, null, {
      skip: page * pageSize,
      limit: pageSize
    })
      .populate({
        path: "user",
        select: "name email avatar birthday gender phoneNumber address",
        match: {
          $or: [
            { name: new RegExp(query, "i") },
            { email: new RegExp(query, "i") }
          ],
          role: CONSTANTS.ROLE.STANDARD
        },
        options: {
          retainNullValues: false
        }
      })
      .populate("jobTypes");
    let maids = [];
    for (const maid of tempMaids) {
      if (maid.user) {
        maids.push(maid);
      }
    }
    const total = maids.length;
    res.send({ maids, total });
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Unexpected errors"
    });
  }
});

router.put("/maids/active", adminMiddleware, async (req, res) => {
  try {
    const id = req.body.id;
    const user = await Maid.findById(id);
    if (!user) {
      console.log("Can find helper with id: " + id);
      return res.send({
        errorCode: 1,
        errorMessage: "Can find helper"
      });
    }
    user.active = true;
    await user.save();
    return res.send({ completed: true });
  } catch (e) {
    console.log(e);
    return res.send({
      errorCode: 1,
      errorMessage: "Can find helper"
    });
  }
});

router.put("/maids/deactive", adminMiddleware, async (req, res) => {
  try {
    const id = req.body.id;
    const user = await Maid.findById(id);
    if (!user) {
      console.log("Can find helper with id: " + id);
      return res.send({
        errorCode: 1,
        errorMessage: "Can find helper"
      });
    }
    user.active = false;
    await user.save();
    return res.send({ completed: true });
  } catch (e) {
    console.log(e);
    return res.send({
      errorCode: 1,
      errorMessage: "Can find helper"
    });
  }
});

router.get("/maids/search", authMiddleware, async (req, res) => {
  try {
    const pageIndex = req.query.pageIndex ? req.query.pageIndex * 1 : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize * 1 : 10;
    const search = req.query.search ? req.query.search : "";
    const services = req.query.services ? req.query.services.split(",").map(ObjectId) : [];
    const areas = req.query.areas ? req.query.areas.split(",").map(Number) : [];
    const minSalary = req.query.minSalary ? req.query.minSalary : 0;
    const maxSalary = req.query.maxSalary ? req.query.maxSalary : 0;
    const sort = req.query.sort && req.query.sort === "distance" ? { "distance": 1 } : { "ratting": -1 };
    const lat = req.query.lat;
    const long = req.query.lat;
    const user = req.user;
    const coordinates = lat && long
      ? [long, lat]
      : user.lat && user.long ? [user.long, user.lat] : null;

    console.log("========")
    console.log("Search helper")
    console.log(pageIndex);
    console.log(pageSize);
    console.log(search);
    console.log(services);
    console.log(areas);
    console.log(minSalary);
    console.log(maxSalary);
    console.log(sort)
    console.log(coordinates);

    const updateMaids = await Maid.find({
      $or: [
        { "location": null },
        { "location.coordinates": [0.0, 0.0] }
      ]
    }).populate("user", "lat long");
    updateMaids.forEach(async (maid) => {
      maid.location = {
        type: "Point",
        coordinates: maid.user.long && maid.user.lat ? [maid.user.long, maid.user.lat] : [0.0, 0.0]
      }
      await maid.save();
    });

    if (coordinates) {
      const maids = await Maid
        .aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: coordinates
              },
              distanceField: "distance",
              includeLocs: "location",
              spherical: true
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          { $unwind: "$user_info" },
          {
            $match: {
              $and: [
                { "user_info._id": { $ne: new ObjectId(user._id) } },
                { "user_info.name": { $regex: search, $options: "i" } },
                { "salary": { $gte: Number(minSalary), $lte: Number(maxSalary) } },
                areas.length !== 0 ? { "supportAreas": { $in: areas } } : {},
                services.length !== 0 ? { "jobTypes": { $in: services } } : {},
              ]
            }
          },
          {
            $project: {
              _id: 1,
              salary: 1,
              ratting: 1,
              distance: "$distance",
              location: "$location.coordinates",
              name: "$user_info.name",
              avatar: "$user_info.avatar",
            }
          },
          { "$sort": sort },
          { "$skip": pageIndex * pageSize },
          { "$limit": pageSize }
        ]);
      console.log(maids);
      res.send({ maids });
    } else if (sort.distance) {
      const maids = await Maid
        .aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          { $unwind: "$user_info" },
          {
            $match: {
              $and: [
                { "user_info._id": { $ne: new ObjectId(user._id) } },
                { "user_info.name": { $regex: search, $options: "i" } },
                { "salary": { $gte: Number(minSalary), $lte: Number(maxSalary) } },
                areas.length !== 0 ? { "supportAreas": { $in: areas } } : {},
                services.length !== 0 ? { "jobTypes": { $in: services } } : {},
              ]
            }
          },
          {
            $project: {
              _id: 1,
              salary: 1,
              ratting: 1,
              name: "$user_info.name",
              avatar: "$user_info.avatar",
            }
          },
          { "$sort": sort },
          { "$skip": pageIndex * pageSize },
          { "$limit": pageSize }
        ]);
      console.log(maids);
      res.send({ maids });
    } else {
      res.send({
        errorCode: 1,
        errorMessage: "no_location"
      });
    }
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Unexpected errors"
    });
  }
});

module.exports = router;
