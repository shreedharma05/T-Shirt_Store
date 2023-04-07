const express = require('express')
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for the product'],
        trim: true,
        maxlength: [120, 'Product name should not contain more than 120 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price for the product'],
        maxlength: [5, 'Product price should not contain more than 5 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'please select from - short-sleeves, long-sleeves, sweat-shirts and hoodies'],
        enum: {
            values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
            message: "please select from - short-sleeves, long-sleeves, sweat-shirts and hoodies"
        }
    },
    brand: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: [true, 'Please provide number of stocks available']
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema)