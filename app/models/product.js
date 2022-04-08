const mongoose = require('mongoose')

const reviewSchema = require('./review')

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true
		},
		category: {
			type: String,
			required: true
		},
		stock: {
			type: Number,
			required: true
		},
		image: {
			type: String,
			required: true,
			default: '../imgs/image.png'
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		reviews: [reviewSchema]
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Product', productSchema)