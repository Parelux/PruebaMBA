const express = require('express')
const { authMW, isAdmin } = require('../middleware/auth')
const exportTransactionToCSV = require('../middleware/csvExporter')
const transactionController = require('../controllers/transactions.controller')
const router = new express.Router()

//TODO Users should only be able to make transactions or add connections only after login 
//TODO Users can send and receive money to accounts which are there connection. Each transaction should be in the database.
//TODO Each transaction should also be saved in a .csv file in the file system with following format.
//TODO Bank makes 1% on each transaction below 1,000 and 0.5% every transasction above 1,000.
router.post('/transactions/from/:user_account_id/to/:destinatary_account_id', authMW, transactionController.executeTransaction, exportTransactionToCSV)

//TODO Users should be able to see their past transactions.
router.get('/transactions/historical', authMW, transactionController.userTransactionHistory)

/**
 * TODO Bank admin should be able to see how much money bank has made from transactions 
 * through a separate route, but you can't store that information in an account. 
 * We would like you to use mongo's aggregation framework to calculate money made 
 * by the bank.
 */
//  router.get('/admin/balance', authMW, isAdmin ,transactionController.transactionsBalanceForAdmin)
router.get('/admin/balance', authMW ,transactionController.transactionsBalanceForAdmin)


module.exports = router