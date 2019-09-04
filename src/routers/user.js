const express = require('express')
const { check, validationResult } = require('express-validator')
const admin = require("firebase-admin")
const fs = require('fs')
const path = require('path');
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

// router.post('/users', async (req, res) => {
//     const user = new User(req.body)

//     try {
//         await user.save()
//         const token = await user.generateAuthToken()
//         res.status(201).send({ user, token })
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.post('/users/login', async (req, res) => {
//     try {
//         const user = await User.findByCredentials(req.body.email, req.body.password)
//         const token = await user.generateAuthToken()
//         res.send({ user, token })
//     } catch (e) {
//         res.status(400).send()
//     }
// })

// router.post('/users/logout', auth, async (req, res) => {
//     try {
//         req.user.tokens = req.user.tokens.filter((token) => {
//             return token.token !== req.token
//         })
//         await req.user.save()

//         res.send()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// router.post('/users/logoutAll', auth, async (req, res) => {
//     try {
//         req.user.tokens = []
//         await req.user.save()
//         res.send()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// router.get('/users/me', auth, async (req, res) => {
//     res.send(req.user)
// })

// router.patch('/users/me', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         updates.forEach((update) => req.user[update] = req.body[update])
//         await req.user.save()
//         res.send(req.user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.delete('/users/me', auth, async (req, res) => {
//     try {
//         await req.user.remove()
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.get('/test', (req, res) => {
    console.log(req)
    res.send({data: 'OK'})
})

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
                    let privateKey = fs.readFileSync(path.join(__dirname, '../configs/private.key'), 'utf8');
                    let token = jwt.sign({user: user}, privateKey, { algorithm: 'RS256'});
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
)

module.exports = router