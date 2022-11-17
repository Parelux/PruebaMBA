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
            error: 'You are transfering more money than you \
            have in the account'
        })
    }

    try {
        //Validate target account
        const targetAccount = await Account.findOne({
            accountId: targetAccountId
        })
        if (!targetAccount){
            return res.status(400).send({
                error: 'You can only send transfers to existing accounts'
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
        if (!connectionAvailable){
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

        console.log("***Executing new transaction***: ", transaction)
        await userAccount.getAmountFromAccount(totalTransfer)
        console.log("***Extracted money from origin account***: ", userAccount, totalTransfer)
        
        const intermediateAccount = await Account.find({
            accountId: process.env.INTERMEDIATE_ACCOUNTID
        })
        await intermediateAccount.transferMoneyToAccount(transaction.amount)
        console.log("***Transfered money to intermediate account***: ", targetAccount, transaction.amount)

        res.status(200).send({
            info: "Your transaction is being proccesed, you can \
            still cancel it, if no more than one minute has elapsed"
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
    const transaction_id = req.params.transaction_id

    const transactionToCancel = await Transaction.find({
        _id: transaction_id
    })

    if (!transactionToCancel) {
        return res.status(404).send({ error: "Transaction not found" })
    }

    if (transactionToCancel.error) {
        return res.status(500).send({ error: "Transaction error, contact an administrator." })
    }

    if (!transactionToCancel.pending) {
        return res.status(400).send({ error: "Transaction already executed." })
    }

    if (!transactionInTime(transactionToCancel)) {
        return res.status(400).send({ error: "You can only cancel transactions in the next minute they are made" })
    }

    //Cancel the transaction
    try {
        transactionToCancel.cancelled = true;
        await transaction.save()

        console.info("User manually cancelled transaction " + transactionToCancel._id.toString())
        return res.status(200).send({ info: "Transaction cancelled, your money will be returned in the next minutes" })
    } catch (e) {
        console.error("Error cancelling the transaction " + transactionToCancel._id.toString() + " :", e)
        return res.status(500).send({ error: `Something wrong happened cancelling the transaction ${transactionToCancel._id.toString()}` })
    }
}

const userTransactionHistory = async (req, res, next) => {
    const user = req.user
    const accountId = user.account.accountId

    const incomingTransactions = await Transaction.find({
        targetAccountId: accountId
    })

    const outgoingTransactions = await Transaction.find({
        originAccountId: accountId
    })

    res.status(200).send({
        incomingTransactions: incomingTransactions,
        outgoingTransactions: outgoingTransactions
    })
}

const transactionsBalanceForAdmin = async (req, res, next) => {

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
                                process.env.BANK_LT1000_TAXES
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
                                process.env.BANK_GT1000_TAXES
                            ] 
                        }
                    }
                }
            }
        ]
        const resultGT1000 = await Transaction
            .aggregate(pipelineGT1000, { allowDiskUse: true })

        return res.status(200).send({
            totalBenefits: resultLT1000[0].totalBenefit + resultGT1000[0].totalBenefit
        })
    } catch (e) {
        console.error("Error performing the querys", e)
    }
}

const transactionInTime = (transaction) => {
    const ONE_MINUTE = 60 * 1000;
    let timeStampNotInTime = transaction.timeStamp + ONE_MINUTE;

    if (timeStampNotInTime < Date.now()) {
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