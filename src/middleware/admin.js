const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const CONSTANTS = require('../utils/constants');
const User = require('../models/user');

const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        let publicKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key.pub'), 'utf8');
        jwt.verify(token, publicKey, { algorithms: ['RS256'], ignoreExpiration: true }, async (err, payload) => {
            if (!err) {
                const userJwt = payload.user;
                const user = await User.findById(userJwt._id);
                if (!user || user.role != CONSTANTS.ROLE.ADMIN) {
                    return res.status(401).send({
                        errorCode: 401,
                        errorMessage: 'Unauthorized'
                    });
                }
                req.user = user;
                req.token = token;
                next();
            } else {
                console.log(err);
                return res.status(401).send({
                    errorCode: 401,
                    errorMessage: 'Unauthorized'
                });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(401).send({
            errorCode: 401,
            errorMessage: 'Unauthorized'
        });
    }
}

module.exports = adminMiddleware;