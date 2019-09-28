const mongoose = require("mongoose");
const validator = require("validator");

const intervalSchema = new mongoose.Schema({
    options: {
        type: Map,
        of: Boolean,
    },
    days: {
        type: [Date],
        required: true
    },
}, {
    timestamps: true
});

const Interval = mongoose.model("Interval", intervalSchema);

module.exports = Interval;
