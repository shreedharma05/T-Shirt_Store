const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [30, 'Name is too long']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unnique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password is atleast 6 characters long'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
            // required: true
        },
        secure_url: {
            type: String,
            // required: true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: String,
    createdAt: {
        type: Date,
        default: Date.now
    }

})

// encrypt password before save - HOOKS
userSchema.pre('save', async function (next){
    if(!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
// validate password with user's OG password
userSchema.methods.isPasswordValidated = async function(sentPassword) {
    return await bcrypt.compare(sentPassword, this.password)
}

// create and return jwt token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function() {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex")
    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")
    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

    return forgotToken
}

module.exports = mongoose.model('User', userSchema)