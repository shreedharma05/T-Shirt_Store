const express = require('express')
const router = express.Router()
const { addProduct, getProducts, adminGetProducts, getOneProduct, adminUpdateProduct, adminDeleteProduct, addReview, deleteReview, getReviewsProduct } = require('../controllers/productController')
const { isLoggedIn, customRole } = require('../middlewares/user')

// User Routes
router.route('/products').get(getProducts)

router.route('/product/:id').get(getOneProduct)

router.route('/review').put(isLoggedIn, addReview).delete(isLoggedIn, deleteReview)

router.route('/reviews').get(getReviewsProduct)

// Admin Routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct)

router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetProducts)

router.route('/admin/product/:id')
    .put(isLoggedIn, customRole('admin'), adminUpdateProduct)
    .delete(isLoggedIn, customRole('admin'), adminDeleteProduct)

module.exports = router