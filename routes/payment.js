const express = require('express')
const router = express.Router()
const { sendStripeKey, sendRazorpayKey, captureStripePayment, captureRazorpayPayment } = require('../controllers/paymentControllers')
const { isLoggedIn } = require('../middlewares/user')

router.route('/stripekey').get( isLoggedIn, sendStripeKey)

router.route('/payment/stripe').post( isLoggedIn, captureStripePayment)

router.route('/razorpaykey').get( isLoggedIn, sendRazorpayKey)

router.route('/payment/razorpay').post( isLoggedIn, captureRazorpayPayment)

module.exports = router