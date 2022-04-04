// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for product
const Product = require('../models/product')

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
// INDEX -> GET /products
router.get('/products', (req, res, next) => {
	Product.find()
		.populate('owner')
		.then((products) => {
			// `products` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return products.map((products) => products.toObject())
		})
		// respond with status 200 and JSON of the products
		.then( (products) => res.status(200).json({ products: products }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// INDEX collectibles products -> GET /products/collectibles
router.get('/products/collectibles', (req,res,next) => {
	Product.find({category:'collectibles'})
		.populate('owner')
		.then((collectibles)=> {
			return collectibles.map((collectibles) => collectibles.toObject())
		})	
		.then((collectibles) => res.status(200).json( {collectibles: collectibles}))
		.catch(next)
})

// INDEX electronics products -> GET /products/electronics
router.get('/products/electronics', (req, res, next) => {
	Product.find({ category: 'electronics' })
		.populate('owner')
		.then( electronics => {
			return electronics.map( (electronics) => electronics.toObject())
		})
		.then( (electronics) => res.status(200).json({electronics: electronics}))
		.catch(next)
})

// INDEX clothing products -> GET /products/clothing
router.get('/products/clothing', (req, res, next) => {
	Product.find({ category: 'clothing' })
		.populate('owner')
		.then( clothing => {
			return clothing.map( (clothing) => clothing.toObject())
		})
		.then( (clothing) => res.status(200).json({clothing: clothing}))
		.catch(next)
})

// SHOW -> GET /products/5a7db6c74d55bc51bdf39793
router.get('/products/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Product.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "example" JSON
		.then((product) => res.status(200).json({ product: product.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE -> POST /products
router.post('/products', requireToken, (req, res, next) => {
	// set owner of new example to be current user
	req.body.product.owner = req.user.id

	Product.create(req.body.product)
		// respond to succesful `create` with status 201 and JSON of new "example"
		.then((product) => {
			res.status(201).json({ product: product.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE -> PATCH /products/5a7db6c74d55bc51bdf39793
router.patch('/products/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.product.owner

	Product.findById(req.params.id)
		.then(handle404)
		.then((product) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, product)

			// pass the result of Mongoose's `.update` to the next `.then`
			return product.updateOne(req.body.product)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// MINE -> GET /products/mine
router.get('/products/mine', requireToken, (req, res, next) => {
	// Find the products
	Product.findById()
	.then((products) => {
		// `products` will be an array of Mongoose documents
		// we want to convert each one to a POJO, so we use `.map` to
		// apply `.toObject` to each one
		requireOwnership(req, products)
		return products.map((products) => products.toObject())
	})
	// respond with status 200 and JSON of the products
	.then((products) => res.status(200).json({ products: products }))
	// if an error occurs, pass it to the handler
	.catch(next)
})

// DESTROY -> DELETE /products/
router.delete('/products/:id', requireToken, (req, res, next) => {
	Product.findById(req.params.id)
		.then(handle404)
		.then((product) => {
			// Error if current user does not own the product
			requireOwnership(req, product)
			// Delete the product ONLY IF the above didn't error
			product.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

/***********************************************/

module.exports = router
