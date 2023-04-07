const Razorpay = require('razorpay')
const BigPromise = require('../middlewares/bigPromise')
const stripe = require('stripe')(process.env.STRIPE_SECRET)

exports.sendStripeKey = BigPromise( (req, res, next) => {
    res.status(200).json({
        STRIPE_API_KEY: process.env.STRIPE_API_KEY
    })
})

exports.captureStripePayment = BigPromise( async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",

        // optional
        metadata: { integration_check: "accept_a_payment"}
    })

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret
        // you can send optional details as well from the paymentIntent
    })
})

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY
    })
})

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
    const instance = Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    })

    const options = {
        amount: req.body.amount, // amount in smallest currency unit
        currency: "INR"
    }

    const myOrder = instance.orders.create(options)

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    })
})
