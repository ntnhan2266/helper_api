const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    maid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Maid",
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    reason: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: null,
    },
}, {
    timestamps: true
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
