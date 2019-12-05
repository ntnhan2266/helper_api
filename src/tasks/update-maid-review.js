const cron = require('node-cron');
const mongoose = require("mongoose");
const _ = require("lodash");
const Maid = require('../models/maid');
const Review = require('../models/review');

cron.schedule('0 0 * * *', () => {
    
});