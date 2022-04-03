// import our dependecies, middleware and models 
const express = require('express')
const passport = require('passport')
const Product = require('../models/product')
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate('bearer', { session: false })
const removeBlanks = require('../../lib/remove_blank_fields')

const router = express.Router()


/******************** ROUTES *******************/

// POST -> create a review
// POST /reviews/<product_id>
router.post('/reviews/:productId', (req, res, next) => {
    // get our review from req.body
    const review = req.body.review
    // get our reviewId from req.params.id
    const productId = req.params.productId
    Product.findById(productId)
        // handle what happens if no review is found
        .then(handle404)
        .then(product => {
            console.log('this is the product', product)
            console.log('this is the review', review)
            // push the review to the reviews array
            product.reviews.push(review)
            return product.save()
        })
        .then(product => res.status(201).json({ product: product }))
        // catch errors and send to the handler
        .catch(next)
})





module.exports = router