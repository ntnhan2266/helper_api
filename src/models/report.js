const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Maid",
        default: null,
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
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
