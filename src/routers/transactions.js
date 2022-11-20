const express = require('express')
const { authMW, isAdmin } = require('../middleware/auth')
const exportTransactionToCSV = require('../middleware/csvExporter')
const transactionController = require('../controllers/transactions.controller')
const router = new express.Router()

//Creates a new transaction
router.post('/transactions', authMW, transactionController.executeTransaction, exportTransactionToCSV)

//Cancel a pending transaction
router.delete('/transactions/:transaction_id', authMW, transactionController.undoTransaction)

//Get the transaction history for this user
router.get('/transactions/historical', authMW, transactionController.userTransactionHistory)

//Get the bank benefit as administrator user
router.get('/admin/balance', authMW, isAdmin ,transactionController.transactionsBalanceForAdmin)


module.exports = router