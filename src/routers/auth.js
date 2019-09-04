const Guid = require('guid');
const bodyParser = require("body-parser");
const express = require('express');
const router = new express.Router()

const fbConfig = require('../configs/fb-config')
const csrf_guid = Guid.raw();

router.get('/get-csrf', (req, res) => {
    try {
        const data = {
            csrf: csrf_guid
        };
        res.send(data);
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/login-by-phone', (req, res) => {
    
})

module.exports = router
