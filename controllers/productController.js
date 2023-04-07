const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const Product = require('../models/product')
const cloudinary = require('cloudinary')
const WhereClause = require('../utils/whereClause')
const { listeners } = require('../models/user')
const product = require('../models/product')

// User Only Controllers
exports.getProducts = BigPromise(async (req, res, next) => {

    const resultPerPage = 6
    const totalProductCount = await Product.find().estimatedDocumentCount()

    let productsObj = new WhereClause(Product.find(), req.query).search().filter()

    let products = await productsObj.base

    const filteredProductCount = products.length

    productsObj.pager(resultPerPage)

    products = await productsObj.base.clone()
    
    res.status(200).json({
        success: true,
        products,
        filteredProductCount,
        totalProductCount
    })
})

exports.getOneProduct = BigPromise( async (req, res, next) => {
    const productId = req.params.id

    product = await Product.findById(productId)

    if (!product) {
        return next(new CustomError('There is no product with the sent ID', 404))
    }

    res.status(200).json({
        success: true,
        product
    })
})

exports.addReview = BigPromise( async (req, res, next) => {
    // Destructure
    const { rating, comment, productId} = req.body

    const newReview = {
        user: req.user._id,
        name: req.user.name,
        rating: rating,
        comment: comment
    }

    product = await Product.findById(productId)
    let alreadyReviewed = product.reviews.find( review => review.user.toString() === newReview.user.toString() )

    if (alreadyReviewed) {
        product.reviews.forEach( review => {
            if (review.user.toString() === newReview.user.toString()) {
                review.rating = rating,
                review.comment = comment
            }
        })
    } else {
        product.reviews.push(newReview)
        product.numberOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc / product.reviews.length)

    await product.save({validateBeforeSave: true})

    res.status(200).json({
        success: true
    })
})

exports.deleteReview = BigPromise( async (req, res, next) => {
    const { productId } = req.query

    const product = await Product.findById(productId)

    const reviews = product.reviews.filter( review => review.user.toString() === req.user._id.toString() )

    const numberOfReviews = reviews.length

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc / product.reviews.length)
    
    await Product.findByIdAndUpdate(productId, {reviews, numberOfReviews, ratings}, { new: true, runValidators: true })

    res.status(200).json({
        success: true
    })
})

exports.getReviewsProduct = BigPromise( async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Admin Only Controllers
exports.addProduct = BigPromise( async (req, res, next) => {
    
    this.user = req.user.id

    if (!req.files.photos) {
        return next(new CustomError('Uh oh, we havn\'t recieved the product\'s photos'))
    }

    let imageArray = []

    if (req.files.photos) {

        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(
                req.files.photos[index].tempFilePath, 
                { folder: 'products'}
            )
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray
    req.body.user = this.user.id

    const product = await Product.create(req.body)

    res.status(200).json({
        success: true,
        product
    })

})

exports.adminGetProducts = BigPromise( async (req, res, next) => {
    const products = await Product.find()

    res.status(200).json({
        success: true,
        products
    })
})

exports.adminUpdateProduct = BigPromise( async (req, res, next) => {
    const productId = req.params.id
    let product = await Product.findById(productId)

    if (!product) {
        return next(new CustomError('There is no product with the sent ID', 404))
    }

    let imageArray = []

    if (req.files.photos) {

        // Delete exisisting photos from cloudinary
        for (let index = 0; index < product.photos.length; index++) {
            await cloudinary.v2.uploader.destroy(product.photos[index].id)
        }

        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, { folder: "products"})
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray

    product = await Product.findByIdAndUpdate(productId, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })

})

exports.adminDeleteProduct = BigPromise( async (req, res, next) => {
    productId = req.params.id
    product = await Product.findById(productId)

    // Delete photos from cloudinary
    for (let index = 0; index < product.photos.length; index++) {
        await cloudinary.v2.uploader.destroy(product.photos[index].id)
    }

    await product.deleteOne()

    res.status(200).send('Product deleted successfully')
})

