const express = require('express')
const router = express.Router()
const { isLoggedIn, customRole} = require('../middlewares/user')
const { createOrder, getOrder, getMyOrder, adminGetAllOrders, adminUpdateOrder, adminDeleteOrder} = require('../controllers/orderController')

// User Routes
router.route('/order/create').post(isLoggedIn, createOrder)
router.route('/order/:id').get(isLoggedIn, getOrder)
router.route('/myorders').get(isLoggedIn, getMyOrder)

// Admin Routes
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), adminGetAllOrders)
router.route('/admin/order/:id')
    .put(isLoggedIn, customRole('admin'), adminUpdateOrder)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOrder)


module.exports = router