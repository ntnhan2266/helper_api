const express = require('express');
const { check, validationResult } = require('express-validator');
const admin = require("firebase-admin")
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const router = new express.Router();

router.post('/user/edit', authMiddleware, async (req, res) => {
    try {
        const requestUser = req.user;
        const user = await User.findById(requestUser._id);
        const body = req.body;
        user.name = body.name;
        user.email = body.email;
        user.gender = body.gender;
        user.phoneNumber = body.phoneNumber;
        user.long = body.long;
        user.lat = body.lat;
        user.address = body.address;
        user.birthday = Date.parse(body.birthday);
        user.avatar = body.avatar;
        await user.save();
        res.send({user});
    } catch(e) {
        res.send({
            errorCode: 1,
            errorMessage: 'Can not verify token'
        });
    }
});

module.exports = router;