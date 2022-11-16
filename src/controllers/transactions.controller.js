const Account = require('../models/account.model')
const Connection = require('../models/connection.model')
const Transaction = require('../models/transaction.model')


const executeTransaction = async (req, res, next) => {
    const user = req.user
    const userAccount = req.user.account
    const amountToTransfer = req.body.amountToTransfer
    const targetAccountId = req.body.targetAccountId

    //Bank taxes percentages should go to a env file
    const bankComission = amountToTransfer > 1000 ? 0.005 : 0.01;

    const bankTaxes = amountToTransfer * bankComission;
    const totalTransfer = amountToTransfer + bankTaxes;


    if (totalTransfer > userAccount.balance) {
        return res.status(400).send({
            error: 'You are transfering more money than you \
            have in the account'
        })
    }

    try {
        const targetAccount = await Account.findOne({
            accountId: targetAccountId
        })
        if (!targetAccount)
            return res.status(400).send({
                error: 'You can only send transfers to existing accounts'
            })

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

        if (!connectionAvailable)
            return res.status(400).send({
                error: 'You can only send transfers to connected accounts'
            })

        //Execute the transaction
        const transaction = new Transaction({
            originAccountId: userAccount.accountId,
            targetAccountId: targetAccountId,
            amount: amountToTransfer,
        })
        await transaction.save()
        console.log("***Executing new transaction***: ", transaction)
        await userAccount.getAmountFromAccount(totalTransfer)
        console.log("***Extracted money from origin account***: ", userAccount, totalTransfer)
        await targetAccount.transferMoneyToAccount(transaction.amount)
        console.log("***Transfered money to destinatary account***: ", targetAccount, transaction.amount)

        req.transaction = transaction
        res.status(200).send(transaction)

        //Print a CSV for the transaction
        next()

    } catch (e) {
        console.error("Error performing the transaction: ", e)
        res.status(500).send({ error: "Error executing the transaction" })
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
            {
                $group: {
                    _id: null,
                    totalBenefit: {
                        $sum: { $multiply: ['$amount', 0.01] }
                    }
                }
            }
        ]
        const resultLT1000 = await Transaction
            .aggregate(pipelineLT1000, { allowDiskUse: true })

        //Calculate benefits from transations greater than 1000
        const pipelineGT1000 = [
            //Stage 1 Filter documents
            { $match: { amount: { $gt: 1000 } } },

            //Stage 2: Operate with percentages
            { $group: {
                    _id: null,
                    totalBenefit: {
                        $sum: { $multiply: ['$amount', 0.005] }
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

const undoTransaction = (req, res, next) => {
    res.status(404).send('Not implemented')
}


module.exports = {
    executeTransaction,
    userTransactionHistory,
    transactionsBalanceForAdmin,
    undoTransaction
}