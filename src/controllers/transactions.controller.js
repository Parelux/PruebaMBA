const Transaction = require('../models/transaction.model')


const executeTransaction = (req, res, next) => {
    res.status(404).send('Not implemented')
}

const userTransactionHistory = (req, res, next) => {
    res.status(404).send('Not implemented')
}

const transactionsBalanceForAdmin = (req, res, next) => {
    res.status(404).send('Not implemented')
}


module.exports = {
    executeTransaction,
    userTransactionHistory,
    transactionsBalanceForAdmin
}