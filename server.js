// require necessary NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// require route files
const productRoutes = require('./app/routes/product_routes')
const userRoutes = require('./app/routes/user_routes')
const reviewRoutes = require('./app/routes/review_routes')
const orderRoutes = require('./app/routes/order_routes')
const stripe_routes = require('./app/routes/stripe_routes')

// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// require Stripe to accept payments
const stripe = require('stripe')(process.env.STRIPE_PUBKEY)

// Setup PaymentIntent Stripe Object to represent the intent to collect a payment form a customer.
// const paymentIntent = await stripe.paymentIntents.create({
// 	amount: 1099,
// 	currency: 'usd',
// 	metadata: {integration_check: 'accept_a_payment'},
// })

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 8000
const clientDevPort = 3000

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
	useNewUrlParser: true,
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}`,
	})
)

// define port for API to run on
// adding PORT= to your env file will be necessary for deployment
const port = process.env.PORT || serverDevPort

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(productRoutes)
app.use(userRoutes)
app.use(reviewRoutes)
app.use(orderRoutes)
app.use(stripe_routes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

app.post('/create-checkout-session', async (req, res) => {
	const session = await stripe.checkout.sessions.create({
	  line_items: [
		{
		  // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
		  price: 999,
		  quantity: 1,
		},
	  ],
	  mode: 'payment',
	  success_url: `http://localhost:${serverDevPort}?success=true`,
	  cancel_url: `http://localhost:${serverDevPort}?canceled=true`,
	});
  
	res.redirect(303, session.url);
  });  

// run API on designated port (4741 in this case)
app.listen(port, () => {
	console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
