const mongoose = require("mongoose");
const validator = require("validator");

const settingSchema = new mongoose.Schema({
  daysToReview: {
    type: Number,
    default: 3
  }
});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
