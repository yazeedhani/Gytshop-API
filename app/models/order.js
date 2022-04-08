const mongoose = require('mongoose')
const Product = require('./product')

const orderSchema = new mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        quantity: {
            type: Number,
            default: 0
        },
        // orderDate: {
        //     type: Date,
        //     required: true
        // },
        shippingAddress: {
            type: String,
            // required: true
        },
        orderStatus: {
            type: Boolean,
            default: false,
        },
        productsOrdered: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                }
            ]
        }
    },{
		timestamps: true,
	}
)

module.exports = mongoose.model('Order', orderSchema)