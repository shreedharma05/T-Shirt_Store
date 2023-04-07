const User = require('../models/user')
const BigPromise = require('./bigPromise')
const CustomError = require('../utils/customError')
const jwt = require('jsonwebtoken')

exports.isLoggedIn = BigPromise(async (req, res, next) => {

    // collecting token from cookies or header (incase of mobile)
    const token = req.cookies.token || req.header("Authorization").replace('Bearer ', '')

    if(!token){
        return next(new CustomError('Login to access this page', 401))
    }

    // decoding the token inorder to get id created by DB while creating a new user
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // injecting custom property in request
    req.user = await User.findById(decoded.id)

    // follow onto next middleware
    next()
})

exports.customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            return next(new CustomError(`Only ${roles[0]}s have access to this page`, 403))
        }
        next()
    }
}