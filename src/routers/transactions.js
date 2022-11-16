const express = require('express')
const { authMW, isAdmin } = require('../middleware/auth')
const exportTransactionToCSV = require('../middleware/csvExporter')
const transactionController = require('../controllers/transactions.controller')
const router = new express.Router()

router.post('/transactions/from/:user_account_id/to/:destinatary_account_id', authMW, transactionController.executeTransaction, exportTransactionToCSV)

router.delete('/transactions/:transaction_id', authMW, transactionController.undoTransaction)

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