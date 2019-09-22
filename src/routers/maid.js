const express = require('express');

const Maid = require('../models/maid');
const authMiddleware = require('../middleware/auth');
const router = new express.Router();

router.get('/maid', authMiddleware,
    async (req, res) => {
        try {
            const requestUser = req.user;
            const maid = await Maid.findOne({userId: requestUser._id});
            res.send({maid, isHost: true});
        } catch (e) {
            console.log(e);
            res.send({isHost: false, maid: null});
        }
    }
);

module.exports = router;