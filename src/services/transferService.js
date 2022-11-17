const Account = require("../models/account.model");
const Transaction = require("../models/transaction.model");
const CronJob = require('cron').CronJob;

/**
 * This is the heart of the Transfer Service,
 * Each time this service is called (On each cron iteration):
 * 
 *  1- Check for pending transactions and execute them if 
 * one minute has passed, and they have not been cancelled 
 * by user.
 * 
 *  2- Check for cancelled transactions made in time but still
 * pending, and restore the money to the original account.
 *  
 * (taxes are keeped for the bank, Sorry user!)
 */

//Account used to save cash in pending transactions while processing
let intermediateAccount;

const transferServiceFunction = async () => {
    try {
        console.info("TRANSFER-SERVICE: Checking for pending transactions....")

        //Search for transactions from more than one minute and in pending status
        const pendingTransactions = await Transaction.find({

            //TODO Check this work as expected
            createdAt: { $gt: new Date(Date.now() - 1 * 60 * 1000) },
            pending: true,
            cancelled: false,
            error: false
        })

        //1-> Manage pending transactions
        pendingTransactions.map(async (transaction) => {
            try {
                //Validate target account
                const targetAccount = await Account.find({
                    accountId: transaction.targetAccountId
                })
                if (!targetAccount) {
                    transaction.error = true
                    transaction.errorDescription = "Target account unreachable"
                    await transaction.save()
                    throw new Error('Target account unreachable')
                }

                //Transfer money from temporary account to target account
                if (intermediateAccount.balance < transaction.amount) {
                    throw new Error('Intermediate account with insufficient balance')
                }

                await intermediateAccount.getAmountFromAccount(transaction.amount);
                await targetAccount.transferMoneyToAccount(transaction.amount)

                transaction.pending = false;
                await transaction.save()

                console.info('Transaction ' + transaction._id.toString() + 'completed')

            } catch (e) {
                console.error("Error executing the transaction "+transaction._id.toString()+" :", e)
                transaction.error = true
                transaction.errorDescription = 'Error executing'
                await transaction.save() 
            }
        })

        //Search for cancelled, but still pending, transactions
        const cancelledTransactions = await Transaction.find({
            cancelled: true,
            pending: true,
            error: false
        })

        //2-> Manage cancelled transactions individually
        cancelledTransactions.map(async (transaction) => {
            try {
                const originAccount = await Account.find({
                    accountId: transaction.originAccountId
                })

                await intermediateAccount.getAmountFromAccount(transaction.amount)
                await originAccount.transferMoneyToAccount(transaction.amount)
                
                //Save the process
                transaction.pending = false;
                await transaction.save()

                console.info('Transaction ' + transaction._id.toString() + 'cancelled.')
                
            } catch (e) {
                console.error("Error cancelling the transaction "+transaction._id.toString()+" :", e)
                transaction.error = true
                transaction.errorDescription = "Error cancelling"
                await transaction.save()
            }
        })

        console.info("TRANSFER-SERVICE: All pending transactions were completed.")

    } catch (e) {
        console.error("Severe failure in Transfer service", e)
        console.error("Closing the application...Sorry!")
        process.exit()
    }
}

const transferService = new CronJob(
    '*/' + process.env.TRANSFER_CHECK_INTERVAL_SECS + ' * * * * *',
    transferServiceFunction,
    null,
    false,
    'Europe/Madrid'
);

const startService = async () => {

    //Ensure there will be always a temporary account
    intermediateAccount = await Account.findOneAndUpdate(
        { accountId: process.env.INTERMEDIATE_ACCOUNTID },
        {
            $setOnInsert: {
                accountId: process.env.INTERMEDIATE_ACCOUNTID,
                user: undefined,
                balance: 0
            }
        },
        { upsert: true, new: true, runValidators: true }
    )
    console.info("Account for temporary transactions present/created", intermediateAccount)

    transferService.start();
}

const stopService = async () => {
    transferService.stop();
}







module.exports = {
    startService,
    stopService
}