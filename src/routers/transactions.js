const express = require("express");

const User = require("../models/user");
const Transaction = require('../models/transaction');
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const router = new express.Router();
const CONSTANTS = require('../utils/constants');

router.get("/transactions", adminMiddleware, async (req, res) => {
    try {
        const pageSize = req.query.pageSize * 1 || 10;
        const pageIndex = req.query.pageIndex * 1 || 0;
        const transactions = await Transaction.find({})
            .populate('booking')
            .populate('maid')
            .populate('user')
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
