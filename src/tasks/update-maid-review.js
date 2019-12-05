const cron = require("node-cron");
const mongoose = require("mongoose");
const _ = require("lodash");
const Maid = require("../models/maid");
const Review = require("../models/review");

cron.schedule("* * * * *", async () => {
  try {
    // Get all maid
    const maids = await Maid.find();
    for (let maid of maids) {
      // Get all reviews of maid
      const numberOfRatting = await Review.countDocuments({ maid });
      const avgRatting = await Review.aggregate([
        { $match: { maid: maid._id } },
        { $unwind: "$rating" },
        { $group: { _id: maid._id, average: { $avg: "$rating" } } }
      ]);
      maid.numberOfRatting = numberOfRatting;
      maid.ratting = avgRatting[0].average;
      maid.save();
    }
  } catch (e) {
    console.log(e);
  }
});
