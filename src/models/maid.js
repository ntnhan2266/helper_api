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
    salary: {
        type: Number,
        required: true,
        default: 0,
    },
    jobTypes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    supportAreas: {
        type: [Number],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    ratting: {
        type: Number,
        required: true,
        default: 0,
    },
    numberOfRatting: {
        type: Number,
        required: true,
        default: 0,
    },
    location: {
        type: { type: String },
        coordinates: [Number]
    },
    search: {
        type: String,
        default: "",
    }
}, { timestamps: true });

maidSchema.index({ location: "2dsphere"});

const Maid = mongoose.model('Maid', maidSchema)

module.exports = Maid