const Order = require('../models/order')
const Product = require('../models/product')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')

const updateStock = async (productId, quantity) => {

    const product = await Product.findById(productId)

    product.stock = product.stock - quantity

    await product.save({validateBeforeSave: false})
}

// User Controllers
exports.createOrder = BigPromise( async (req, res, next) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

exports.getOrder = BigPromise(async (req, res, next) => {
    const orderId = req.params.id

    const order = await Order.findById(orderId)

    if (!order) {
        return next(new CustomError('There is no orders with entered id', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

exports.getMyOrder = BigPromise(async (req, res, next) => {

    const order = await Order.find({user: req.user._id})

    if (!order) {
        return next(new CustomError('There is no orders with entered id', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// Admin Controllers
exports.adminGetAllOrders = BigPromise(async (req, res, next) => {

    const orders = await Order.find()

    res.status(200).json({
        success: true,
        orders
    })
})

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {

    const order = Order.findById(req.params.id)

    if (order.orderStatus === 'delivered') {
        return next(new CustomError('This order has been marked as delivered already', 401))
    }

    order.orderStatus = req.body.orderstatus

    order.orderItems.forEach(async e => updateStock(e.product, e.quantity))

    await order.save()

    res.status(200).json({
        success: true,
        current_status: req.body.orderstatus
    })
})

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Orders.findById(req.params.id)

    await order.deleteOne()

    res.status(200).send('The Order has been deleted')
})

