const Account = require('../models/account.model')
const Connection = require('../models/connection.model')
const Transaction = require('../models/transaction.model')


const executeTransaction = async (req, res, next) => {
    const user = req.user
    const userAccount = req.user.account
    const amountToTransfer = req.body.amountToTransfer
    const targetAccountId = req.body.targetAccountId

    //Get the bank commision using env variables
    const bankComission = amountToTransfer > 1000 ?
        process.env.BANK_GT1000_TAXES : process.env.BANK_LT1000_TAXES;

    const bankTaxes = amountToTransfer * bankComission;
    const totalTransfer = amountToTransfer + bankTaxes;


    if (totalTransfer > userAccount.balance) {
        return res.status(400).send({
            error: 'You are transfering more money than you have in the account',
            amount: totalTransfer,
            account: userAccount
        })
    }

    try {
        //Validate target account
        const targetAccount = await Account.findOne({
            accountId: targetAccountId
        })
        if (!targetAccount) {
            return res.status(400).send({
                error: 'You can only send transfers to active accounts'
            })
        }

        //Validate connection between accounts
        const connectionAvailable = await Connection.findOne({
            $and: [
                {
                    $or: [
                        { accountOneId: user.account.accountId },
                        { accountTwoId: user.account.accountId }
                    ]
                },
                {
                    $or: [
                        { accountOneId: user.account.accountId },
                        { accountTwoId: user.account.accountId }
                    ]
                }
            ],
            accountTwoConfirm: true
        })
        if (!connectionAvailable) {
            return res.status(400).send({
                error: 'You can only send transfers to connected accounts'
            })
        }

        //Create the PENDING transaction to be processed later
        const transaction = new Transaction({
            originAccountId: userAccount.accountId,
            targetAccountId: targetAccountId,
            amount: amountToTransfer,
            pending: true,
        })
        await transaction.save()

        console.info("***Executing new transaction*** :", transaction)

        //Get the intermediate account
        const intermediateAccount = await Account.findOne({
            accountId: process.env.INTERMEDIATE_ACCOUNTID
        })

        await userAccount.getAmountFromAccount(totalTransfer)
        // console.info(`*AMOUNT: ${totalTransfer} extracted from user account:*`, userAccount)

        await intermediateAccount.transferMoneyToAccount(totalTransfer)
        // console.info(`*AMOUNT: ${totalTransfer} Transfered to intermediate account*`, intermediateAccount)

        res.status(200).send({
            transaction: transaction,
            info: "Your transaction is being proccesed, you can still cancel it, if no more than one minute has elapsed"
        })

        //Print a CSV for the transaction
        req.transaction = transaction
        next()

    } catch (e) {
        console.error("Error performing the transaction: ", e)
        res.status(500).send({ error: "Error executing the transaction" })
    }
}

const undoTransaction = async (req, res, next) => {
    const userAccountId = req.user.account.accountId
    const transaction_id = req.params.transaction_id

    const transactionToCancel = await Transaction.findOne({
        _id: transaction_id,
        originAccountId: userAccountId
    })

    if (!transactionToCancel) {
        return res.status(404).send({
            error: "Transaction not found"
        })
    }

    if (transactionToCancel.error) {
        return res.status(500).send({
            error: "Transaction error, contact an administrator."
        })
    }

    if (!transactionToCancel.pending) {
        return res.status(400).send({
            error: "Transaction already executed."
        })
    }

    if (!transactionInTime(transactionToCancel)) {
        return res.status(400).send({
            error: "You can only cancel transactions in the next minute they are made"
        })
    }

    //Cancel the transaction
    try {
        transactionToCancel.cancelled = true;
        await transactionToCancel.save()

        console.info("User cancelled transaction " + transactionToCancel._id.toString())
        return res.status(200).send({
            info: "Transaction cancelled, your money will be returned in the next minutes"
        })
    } catch (e) {
        console.error(`Error cancelling the transaction ${transactionToCancel._id.toString()} `, e)
        return res.status(500).send({
            error: `Error cancelling the transaction ${transactionToCancel._id.toString()}`
        })
    }
}

const userTransactionHistory = async (req, res, next) => {
    const user = req.user
    const accountId = user.account.accountId

    //Get sent transactions
    const sentTransactions = await Transaction.find({
        originAccountId: accountId,
        pending: false
    })

    //Get transactions from this user
    const undoTransactions = await Transaction.find({
        originAccountId: accountId,
        cancelled: true
    })



    res.status(200).send({
        sentTransactions: sentTransactions,
        undoTransactions: undoTransactions    
    })
}

const transactionsBalanceForAdmin = async (req, res, next) => {

    const BANK_LT1000_TAXES = Number(process.env.BANK_LT1000_TAXES)
    const BANK_GT1000_TAXES = Number(process.env.BANK_GT1000_TAXES)

    if (!BANK_LT1000_TAXES || !BANK_GT1000_TAXES) {
        return res.status(500).send({ error: "Taxes not defined" })
    }

    try {
        //Calculate benefits from transations lesser than 1000
        const pipelineLT1000 = [
            //Stage 1 Filter documents
            { $match: { amount: { $lt: 1000 } } },

            //Stage 2: Operate with percentages
            { $group: {
                    _id: null,
                    totalBenefit: {
                        $sum: {
                            $multiply: [
                                '$amount',
                                BANK_LT1000_TAXES
                            ]
                        }
                    }
                }
            }
        ]
        const resultLT1000 = await Transaction
            .aggregate(pipelineLT1000, { allowDiskUse: true })

        //Calculate benefits from transations equal or greater than 1000
        const pipelineGT1000 = [
            //Stage 1 Filter documents
            { $match: { amount: { $gte: 1000 } } },

            //Stage 2: Operate with percentages
            { $group: {
                    _id: null,
                    totalBenefit: {
                        $sum: {
                            $multiply: [
                                '$amount',
                                BANK_GT1000_TAXES
                            ]
                        }
                    }
                }
            }
        ]
        const resultGT1000 = await Transaction
            .aggregate(pipelineGT1000, { allowDiskUse: true })

        //Format the exit
        let benefitsFromTransLT1000 = resultLT1000[0]?.totalBenefit? resultLT1000[0].totalBenefit : 0
        let benefitsFromTransGT1000 = resultGT1000[0]?.totalBenefit? resultGT1000[0].totalBenefit : 0

        return res.status(200).send({
            TransactionsLT1000_Benefit: benefitsFromTransLT1000,
            TransactionsGT1000_Benefit: benefitsFromTransGT1000,
            TotalBenefits: benefitsFromTransLT1000 + benefitsFromTransGT1000
        })
    } catch (e) {
        console.error("Error performing the querys", e)
        return res.status(500).send({
            error: "Error performing the querys, contact the technical staff"
        })
    }
}

const transactionInTime = (transaction) => {
    const ONE_MINUTE = 60 * 1000;

    if (transaction.timeStamp > (Date.now() - ONE_MINUTE)) {
        return true
    }
    return false
}


module.exports = {
    executeTransaction,
    userTransactionHistory,
    transactionsBalanceForAdmin,
    undoTransaction
}