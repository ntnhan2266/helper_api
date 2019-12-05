const mongoose = require("mongoose");
const validator = require("validator");

const settingSchema = new mongoose.Schema(
);

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
