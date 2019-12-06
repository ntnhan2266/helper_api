const jwt = require('jsonwebtoken');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
 
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        let publicKey = fs.readFileSync(path.join(__dirname, '../configs/jwtRS256.key.pub'), 'utf8');
        jwt.verify(token, publicKey, { algorithms: ['RS256'], ignoreExpiration: true }, async (err, payload) => {
            if (!err) {
                const user = payload.user;
                req.user = user;
                req.token = token;
                next();
            } else {
                console.log(`token: ${token}`);
                // console.log(err);
                res.status(401).send({ 
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

module.exports = authMiddleware