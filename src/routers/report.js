const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");

const adminMiddleware = require("../middleware/admin");
const authMiddleware = require("../middleware/auth");
const Report = require('../models/report');

router.post("/report", authMiddleware, async (req, res) => {
    try {
        const report = new Report();
        report.user = req.body.maid;
        report.reportedBy = req.user._id;
        report.reason = req.body.reason;
        report.description = req.body.reason;
        await report.save();        
        return res.send({ report });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not create data"
        });
    }
});

module.exports = router;
