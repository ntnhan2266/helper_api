const mongoose = require("mongoose");
const validator = require("validator");

const transactionSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    maid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Maid",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
