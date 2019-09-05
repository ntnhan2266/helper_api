const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
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
}, {timestamps: true});

// userSchema.virtual('tasks', {
//     ref: 'Task',
//     localField: '_id',
//     foreignField: 'owner'
// })

// userSchema.methods.toJSON = function () {
//     const user = this
//     const userObject = user.toObject()

//     delete userObject.password
//     delete userObject.tokens

//     return userObject
// }

// userSchema.methods.generateAuthToken = async function () {
//     const user = this
//     const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

//     user.tokens = user.tokens.concat({ token })
//     await user.save()

//     return token
// }

// userSchema.statics.findByCredentials = async (email, password) => {
//     const user = await User.findOne({ email })

//     if (!user) {
//         throw new Error('Unable to login')
//     }

//     const isMatch = await bcrypt.compare(password, user.password)

//     if (!isMatch) {
//         throw new Error('Unable to login')
//     }

//     return user
// }

// // Hash the plain text password before saving
// userSchema.pre('save', async function (next) {
//     const user = this

//     if (user.isModified('password')) {
//         user.password = await bcrypt.hash(user.password, 8)
//     }

//     next()
// })

// // Delete user tasks when user is removed
// userSchema.pre('remove', async function (next) {
//     const user = this
//     await Task.deleteMany({ owner: user._id })
//     next()
// })

const User = mongoose.model('User', userSchema)

module.exports = User