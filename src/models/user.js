const mongoose = require('mongoose');
const validator = require('validator');
const CONSTANTS = require('../utils/constants');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true,
        default: null,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        default: null,
        trim: true,
        lowercase: true,
        validate(value) {
            if (value != null && !validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    gender: {
        type: Number,
        default: 1,
    },
    birthday: {
        type: Date,
        default: Date('01-01-1990')
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: null,
        validate(value) {
            if (value != null && value.length < 8) {
                throw new Error('Phone number is too short')
            }
        }
    },
    long: {
        type: Number,
        required: false,
        default: null,
    },
    lat: {
        type: Number,
        required: false,
        default: null,
    },
    address: {
        type: String,
        required: false,
        default: null
    },
    avatar: {
        type: String,
        required: false,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isConfirm: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        default: null,
        required: false,
    },
    role: {
        type: Number,
        default: CONSTANTS.ROLE.STANDARD
    },
    code: {
        type: String,
        default: null,
    },
    expiredAt: {
        default: null,
        type: Date
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema)

module.exports = User