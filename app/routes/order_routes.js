// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for order
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
    req.body.order.owner = req.user.id

    Order.create(req.body.cart)
        .then((order) => {
            // send a successful response like this
            res.status(201).json({ order: order.toObject() })
        })
        // if an error occurs, pass it to the error handler
        .catch(next)
})

// UPDATE -> PATCH /order/5a7db6c74d55bc51bdf39793
router.patch('/orders/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.order.owner

	Order.findById(req.params.id)
		.then(handle404)
		.then((order) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, order)

			// pass the result of Mongoose's `.update` to the next `.then`
			return order.updateOne(req.body.order)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY -> DELETE /order/
router.delete('/orders/:id', requireToken, (req, res, next) => {
	Order.findById(req.params.id)
		.then(handle404)
		.then((order) => {
			// Error if current user does not own the order
			requireOwnership(req, order)
			// Delete the order ONLY IF the above didn't error
			order.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})


// First, click on product to enter SHOW page
// Create a form in the show page of the product 
// On show page, select product amount (this should be added to the quantity field in Order)
// Add product to cart by adding the product's ID to the cart(this has an ID) - productsOwned array

/***********************************************/

module.exports = router