const User = require('../models/user')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const mailhelper = require('../utils/emailhelper')
const crypto = require('crypto')
const { token } = require('morgan')

exports.signup = BigPromise( async (req, res, next) => {

    const {name, email, password} = req.body

    if (!email || !name || !password) {
        return next(new CustomError('Please provide us your name, email and password', 400))
    }

    if(!req.files){return next(new CoustomError("Photo is required to get signed up", 400))}

    file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale"
    })

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user, res)
})

exports.signin = BigPromise( async (req, res, next) => {
    const { email, password} = req.body

    // check for presence of email and password
    if(!email || !password){
        return next(new CustomError('Please provide both email and password to singin', 400))
    }

    // get user from DB
    const user = await User.findOne({email}).select("+password")

    // user not found in DB
    if(!user){
        return next(new CustomError('Uh oh, You are not signedup with us'))
    }

    // validate password sent by user with password in DB
    if (!(await user.isPasswordValidated(password))){
        return next(new CustomError('Please enter the correct password'))
    }

    // generate JWT token and send it through cookie 
    cookieToken(user, res)

})

exports.signout = BigPromise((req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        htpponly: true
    })
    res.status(200).json({
        success: true,
        message: "signout success"
    })
})

exports.forgotpassword = BigPromise(async (req, res, next) => {

    const {email} = req.body

    const user = await User.findOne({email})

    if(!user){
        return next(new CustomError('This user does not exists',404))
    }

    //generate forgot password token  
    const forgotToken = user.getForgotPasswordToken()

    // after changing values of forgotPasswordToken and forgotPasswordExpiry save the changes in the DB
    await user.save({validateBeforeSave: false})

    // create a custom url where user can reset password
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    const message = `Please open this link in your browser \n\n ${myUrl}`

    try {
        
        await mailhelper({
            toMail: email,
            subject: "LCO TShirtStore - password reset email",
            message
        })

        res.status(200).json({
            success: true,
            message: "Email sent"
        })

    } catch (error) {
        // as user didn't receive forgotToken via email the saved token and its expiry must be deleted
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({validatBeforeSave: false})

        return next(new CustomError(error.message,500))
    }
})

exports.passwordReset = BigPromise(async (req, res, next) => {
    // grab token from params as it is a variable
    const token = req.params.forgotToken

    // encrypt the token - In DB the token stored after encrypting
    const encToken = crypto.createHash("sha256").update(token).digest("hex")
    console.log(encToken);

    // find the user with matching token and its expiry time
    const user = await User.findOne({
        forgotPasswordToken: encToken, 
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if(!user){
        return next(new CustomError('The token does not match or might be expired', 400))
    }

    // if entered newPassword and confirmPassword doesn't match
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new CustomError('New password and confirm password must be same', 400))
    }

    // reset password and make tokens undefined
    user.password = req.body.newPassword
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    // save the user after changes made
    await user.save()

    // send new token through cookie
    cookieToken(user, res)
})

exports.userDashboard = BigPromise(async (req, res, next) => {

    // getiing user info by providing user id
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

exports.changePassword = BigPromise(async (req, res, next) => {

    // getting id from custom property
    const userId = req.user.id

    // getting user by id
    const user = await User.findById(userId).select("+password")

    // getting required fields to update password
    const oldPassword = req.body.oldpassword
    const newPassword = req.body.newpassword
    const confirmPassword = req.body.confirmpassword

    // validating old password
    if(!(await user.isPasswordValidated(oldPassword))){
        return next(new CustomError('Please enter correct password', 400))   
    }

    if(newPassword !== confirmPassword){
        return next(new CustomError('new password and confirm password does not match', 400))
    }

    // updating password 
    user.password = newPassword
    await user.save()

    // sending new token as password updated
    cookieToken(user, res)
})

exports.updateUserDetails = BigPromise(async (req, res, next) => {

    newData = {
        name: req.body.name,
        email: req.body.email
    }

    if(req.files){

        const user = User.findById(req.user.id)

        const photoId = user.photo.id

        const resp = await cloudinary.v2.uploader.destroy(photoId)

        file = req.files.photo
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        })

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })
})

exports.adminAllUsers = BigPromise(async (req, res, next) => {

    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

exports.admingetOneuser = BigPromise(async (req, res , next) => {
    const user = await User.findById(req.params.id) 

    if (!user) {
        return next(new CustomError('the entered Id does not exists', 404))
    }

    res.status(200).json({
        success: true,
        user
    })
})

exports.adminUpdateOneuser = BigPromise(async (req, res, next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        user
    })
})

exports.adminDeleteOneuser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new CustomError('user not available', 401))
    }

    await cloudinary.v2.uploader.destroy(user.photo.id)

    await user.deleteOne()

    res.status(200).send('user deleted successfully')
})


exports.managerAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find({role: "user"})

    res.status(200).json({
        success: true,
        users
    })
})
