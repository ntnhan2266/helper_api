const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");

const adminMiddleware = require("../middleware/admin");
const authMiddleware = require("../middleware/auth");
const Report = require('../models/report');
const Booking = require('../models/booking');

router.post("/report", authMiddleware, async (req, res) => {
    try {
        const bookingId = req.body.id;
        const booking = await Booking.findById(bookingId);
        const report = new Report();
        report.user = booking.maid;
        report.reportedBy = booking.createdBy;
        report.reason = req.body.reason;
        report.description = req.body.description;
        await report.save();        
        return res.send({ completed: true });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not create data"
        });
    }
});

router.get('reports', adminMiddleware, async (req, res) => {
    try {
        const pageSize = req.query.pageSize * 1 || 10;
        const pageIndex = req.query.pageIndex * 1 || 0;
        const transactions = await Transaction.find({})
            .populate('booking')
            .populate({
                path: 'maid',
                populate: {
                    path: 'user'
                }
            })
            .populate('user')
            .populate('category')
            .skip(pageIndex * pageSize)
            .limit(pageSize)
            .sort([['createdAt', -1]]).lean().exec();
        const total = await Transaction.countDocuments({});
        res.send({ transactions, total });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Something went wrong"
        });
    }
});

module.exports = router;
