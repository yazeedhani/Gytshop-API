// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for product
const Order = require('../models/order')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

/******************** ROUTES *******************/
    //Routes needed
    //Index route for showing items in cart
    //Update route for updating items in cart
    //Delete route for deleting items in cart

    //once a user clicks on the cart tab, they should be brought to their own cart
    //cart should display items that user added by themselves
        //when a user clicks on the add to cart button via show page, 
        //the productId will need to be pushed into the productsOrdered schema 
        //which is an empty array 
        //each user has a specific productOrdered 

//Show Route for showing items in individuals cart
router.get('/orders/:id', requireToken, (req,res,next) => {
    Order.findById(req.params.id)
        //this will populate items in the users current cart
        .then(handle404)
        //if item found, it will show 
        .then(order=> res.status(200).json({order:order.toObject()}))
        .catch(next)
})


// CREATE order
//POST /orders
router.post('/orders', requireToken, (req, res, next) => {
    req.body.product.owner = req.user.id

    Order.create(req.body.cart)
        .then((order) => {
            // send a successful response like this
            res.status(201).json({ order: order.toObject() })
        })
        // if an error occurs, pass it to the error handler
        .catch(next)
})

router.patch('/orders/:id', requireToken, (req, res, next) => {
    req.body.product.owner = req.user.id

    Order.create(req.body.cart)
        .then((order) => {
            // send a successful response like this
            res.status(201).json({ order: order.toObject() })
        })
        // if an error occurs, pass it to the error handler
        .catch(next)
})

// First, click on product to enter SHOW page
// Create a form in the show page of the product 
// On show page, select product amount (this should be added to the quantity field in Order)
// Add product to cart by adding the product's ID to the cart(this has an ID) - productsOwned array

/***********************************************/

module.exports = router