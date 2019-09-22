const mongoose = require('mongoose');

const maidSchema = new mongoose.Schema({
    intro: {
        type: String,
        required: true,
    },
    literacyType: {
        type: Number,
        required: true,
        default: 1,
    },
    exp: {
        type: String,
        required: true,
        maxlength: 255,
        minlength: 50,
    },
    salaryType: {
        type: Number,
        required: true,
        default: 1,
    },
    jobTypes: {
        type: [Number],
    },
    supportAreas: {
        type: [Number],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    }
}, {timestamps: true});

const Maid = mongoose.model('Maid', maidSchema)

module.exports = Maid