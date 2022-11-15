const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user.model')
const Product = require('../../src/models/product.model')

const adminId = new mongoose.Types.ObjectId()
const adminUser = {
    _id: adminId,
    name: 'admin',
    email: 'admin@gmail.com',
    password: 'passKiller',
    tokens: [{
        token: jwt.sign({ _id: adminId }, process.env.JWT_SECRET)
    }]
}

const dummyProductID = new mongoose.Types.ObjectId()
const dummyProduct = {
    _id: dummyProductID,
    name: 'DummyStation',
    description: 'Best game console ever made'
}

/**
 * Clean and create one basic user and product in database
 */
const initializeDatabase = async () => {
    await User.deleteMany()
    await Product.deleteMany()
    await User(adminUser).save()
    await Product(dummyProduct).save()
}

module.exports = {
    adminUser,
    adminId,
    dummyProduct,
    dummyProductID,
    initializeDatabase
}