const express = require('express');
const { check, validationResult } = require('express-validator');
const admin = require("firebase-admin")
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const router = new express.Router();

router.get('/', (req, res) => {
    console.log(req)
    res.send({data: 'OK'})
});

router.post('/register', [
        check('name').not().isEmpty(),
        check('email').not().isEmpty(),
        check('token').not().isEmpty(),
        check('phoneNumber').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Error');
            return res.status(422).json({ errors: errors.array() });
        }
        const { token, name, phoneNumber, email } = req.body;
        // Verify token comes from the client app
        admin.auth().verifyIdToken(token)
            .then(async function(decodedToken) {
                let uid = decodedToken.uid;
                // Check uid is existed
                var existedUser = await User.findOne({
                    uid: uid
                });
                if (!existedUser) {
                    // Create new user with uid, phone, name and email
                    var user = new User({
                        uid: uid,
                        phoneNumber: phoneNumber,
                        email: email,
                        name: name
                    });
                    await user.save();
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
                    let token = jwt.sign({user: user}, privateKey, { algorithm: 'RS256' });
                    res.send({user, token});
                } else {
                    res.send({
                        errorCode: 2,
                        errorMessage: 'UID have been used'
                    })
                }
            }).catch(function(error) {
                console.log(error)
                res.send({
                    errorCode: 1,
                    errorMessage: 'Can not verify token'
                });
            });
    }
);

router.post('/login', [
        check('token').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Error');
            return res.status(422).json({ errors: errors.array() });
        }
        const { token } = req.body;
        // Verify token comes from the client app
        admin.auth().verifyIdToken(token)
            .then(async function(decodedToken) {
                let uid = decodedToken.uid;
                // Find user with uid
                const user = await User.findOne({ uid: uid });
                if (user) {
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
                    let token = jwt.sign({user: user}, privateKey, { algorithm: 'RS256'});
                    res.send({user, token});
                } else {
                    // Login failed
                    res.send({
                        errorCode: 3,
                        errorMessage: 'Phone number has not registered yet'
                    })
                }
                
            }).catch(function(error) {
                console.log(error)
                res.send({
                    errorCode: 1,
                    errorMessage: 'Can not verify token'
                });
            });
    }
);

router.post('/login-with-fb',[
        check('token').not().isEmpty(),
        check('name').not().isEmpty(),
    ],
    async (req, res) => { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Error');
            return res.status(422).json({ errors: errors.array() });
        }
        const { token, name, email } = req.body;
        // Verify token comes from the client app
        admin.auth().verifyIdToken(token)
            .then(async function(decodedToken) {
                let uid = decodedToken.uid;
                // Find user with uid
                const user = await User.findOne({ uid: uid });
                if (user) {
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
                    let token = jwt.sign({user: user}, privateKey, { algorithm: 'RS256'});
                    res.send({user, token});
                } else {
                    // Login failed, create one account with decoded uid
                    // Create new user with uid, phone, name and email
                    var newUser = new User({
                        uid: uid,
                        email: email,
                        name: name
                    });
                    await newUser.save();
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
                    let token = jwt.sign({user: user}, privateKey, { algorithm: 'RS256'});
                    res.send({user: newUser, token});
                }
                
            }).catch(function(error) {
                console.log(error)
                res.send({
                    errorCode: 1,
                    errorMessage: 'Can not verify token'
                });
            });
    }
);

router.get('/auth/me', authMiddleware,
    async (req, res) => {
        const requestUser = req.user;
        const user = await User.findById(requestUser._id);
        res.send({user});
    }
);

module.exports = router;