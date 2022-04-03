const mongoose = require('mongoose')
const Product = require('./product')

const db = require('../../config/db')

const startProducts = [
    { name: 'Mac-book Pro 2020', price: 1099, description: 'Brand new 2020 Mac book', category: 'electronics', stock: 5,owner:"624873a0d81fedadeb20c380" },
    { name: 'Random NFT Card', price: 500, description: 'Buy a random NFT card', category: 'collectibles', stock:20, owner:"624873a0d81fedadeb20c380"},
    { name: 'Levi\'s Blue Jeans', price: 50, description: 'Blue jeans for everyday styling', category: 'clothing',stock:13, owner:"624873a0d81fedadeb20c380"},
    { name: 'Levi\'s Black Jeans', price: 50, description: 'Black jeans for everyday styling', category: 'clothing',stock:12, owner:"624873a0d81fedadeb20c380"},
    { name: 'Gap Blue Jeans', price: 50, description: 'Blue jeans for everyday styling', category: 'clothing',stock:15, owner:"624873a0d81fedadeb20c380"},
    { name: 'Gap Black Jeans', price: 50, description: 'Black jeans for everyday styling', category: 'clothing',stock:10, owner:"624873a0d81fedadeb20c380"},
    { name: 'Sony 50 inch Wide-Screen T.V', price: 399, description: 'Brand new Sony HD TV', category: 'electronics', stock: 3,owner:"624873a0d81fedadeb20c380" },
    { name: 'Beach painting', price: 50, description: 'Art Work painted by Bob Ross', category: 'collectibles',stock:2, owner:"624873a0d81fedadeb20c380"},
    { name: 'iPhone 10', price: 999, description: 'Apple iPhone 10', category: 'electronics',stock:4, owner:"624873a0d81fedadeb20c380"},
    { name: 'Bored Ape Yacht Club', price: 15000, description: 'Rare Bored Ape NFT', category: 'collectibles',stock:1, owner:"624873a0d81fedadeb20c380"}

]

// first we connect to the db via mongoose
mongoose.connect(db, {
	useNewUrlParser: true,
})
    .then(() => {
        // then we remove all the products except the ones that have an owner
        Product.deleteMany({ owner: null })
            .then(deletedProduct => {
                console.log('deleted products', deletedProduct)
                // we'll use console logs to check if it's working or if there are errors
                Product.create(startProducts)
                    .then(newProducts => {
                        mongoose.connection.close()
                    })
                    .catch(err => {
                        console.log(err)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    // then at the end, we close our connection to the db
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })