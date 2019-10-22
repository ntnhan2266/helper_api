const express = require('express');
const { check, validationResult } = require('express-validator');
const admin = require("firebase-admin")
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Email = require('email-templates');
const nodemailer = require('nodemailer');
const moment = require('moment');

const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const router = new express.Router();

const saltRounds = 10;

const makeid = (length) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

router.get('/', (req, res) => {
    console.log(req)
    res.send({ data: 'OK' })
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
            return res.status(422).json({ errors: errors.array() });
        }
        const { token, name, phoneNumber, email } = req.body;
        // Verify token comes from the client app
        admin.auth().verifyIdToken(token)
            .then(async function (decodedToken) {
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
                    let token = jwt.sign({ user: user }, privateKey, { algorithm: 'RS256' });
                    res.send({ user, token });
                } else {
                    res.send({
                        errorCode: 2,
                        errorMessage: 'UID have been used'
                    })
                }
            }).catch(function (error) {
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
            return res.status(422).json({ errors: errors.array() });
        }
        const { token } = req.body;
        // Verify token comes from the client app
        admin.auth().verifyIdToken(token)
            .then(async function (decodedToken) {
                let uid = decodedToken.uid;
                // Find user with uid
                const user = await User.findOne({ uid: uid });
                if (user) {
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
                    let token = jwt.sign({ user: user }, privateKey, { algorithm: 'RS256' });
                    res.send({ user, token });
                } else {
                    // Login failed
                    res.send({
                        errorCode: 3,
                        errorMessage: 'Phone number has not registered yet'
                    })
                }

            }).catch(function (error) {
                console.log(error)
                res.send({
                    errorCode: 1,
                    errorMessage: 'Can not verify token'
                });
            });
    }
);

router.post('/login-with-fb', [
    check('token').not().isEmpty(),
    check('name').not().isEmpty(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const { token, name, email } = req.body;
        // Verify token comes from the client app
        admin.auth().verifyIdToken(token)
            .then(async function (decodedToken) {
                let uid = decodedToken.uid;
                // Find user with uid
                const user = await User.findOne({ uid: uid });
                if (user) {
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
                    let token = jwt.sign({ user: user }, privateKey, { algorithm: 'RS256' });
                    res.send({ user, token });
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
                    let token = jwt.sign({ user: user }, privateKey, { algorithm: 'RS256' });
                    res.send({ user: newUser, token });
                }

            }).catch(function (error) {
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
        res.send({ user });
    }
);

router.post('/register-admin', [
    check('password').not().isEmpty(),
    check('email').not().isEmpty(),
    check('fullname').not().isEmpty(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const { fullname, password, email } = req.body;
            let hash = await bcrypt.hash(password, saltRounds);
            var user = new User({
                password: hash,
                email,
                name: fullname,
                uid: makeid(12)
            });
            await user.save();
            let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
            let token = jwt.sign({ user: user }, privateKey, { algorithm: 'RS256' });
            res.send({ user, token });
        } catch (e) {
            console.log(e);
            res.send({
                errorCode: 1,
                errorMessage: 'Duplicate email'
            });
        }
    }
);

router.post('/login-admin', [
    check('password').not().isEmpty(),
    check('email').not().isEmpty(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email });
            if (!user) {
                res.status(401).send({
                    errorCode: 1,
                    errorMessage: 'Can not login'
                });
            } else {
                let isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key'), 'utf8');
                    let token = jwt.sign({ user: user }, privateKey, { algorithm: 'RS256' });
                    res.send({ user, token });
                } else {
                    res.status(401).send({
                        errorCode: 1,
                        errorMessage: 'Can not login'
                    });
                }
            }
        } catch (e) {
            console.log(e);
            res.status(401).send({
                errorCode: 1,
                errorMessage: 'Can not login'
            });
        }
    }
);

router.post('/forgot-password', [
    check('email').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const userEmail = req.body.email;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.send({ sent: true });
        }
        const expiredTime = new Date(user.expiredAt);
        const now = new Date();
        // Check is have old token
        if (user.code && expiredTime.getTime() > now.getTime()) {
            return res.send({ sent: true });
        }
        const transporter = nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 2525,
            secure: false,
            auth: {
                user: "6f204fbdb15dd0",
                pass: "36a535f5da7793"
            }
        });
        
        // Generate token and save to database
        const expiredAt = moment().add(3, 'd');
        const token = makeid(64);
        user.code = token;
        user.expiredAt = expiredAt;
        await user.save();
        
        // Send email to user
        const root = path.join(__dirname, '../emails');
        const email = new Email({
            transport: transporter,
            send: true,
            preview: false,
            views: { root },
        });

        const url = `http://localhost:4200/reset-password/${token}`;

        await email.send({
            template: 'forgot-password',
            message: {
                from: 'Smart Rabbit <no-reply@rabbit.com>',
                to: userEmail,
            },
            locals: {
                name: user.name,
                url: url,
            }
        });
        console.log('Email has been sent!');
        res.send({ sent: true });
    } catch (e) {
        console.log(e);
        res.status(401).send({
            errorCode: 1,
            errorMessage: 'Can not send email'
        });
    }
});


module.exports = router;