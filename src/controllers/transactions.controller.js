const Account = require('../models/account.model')
const Connection = require('../models/connection.model')
const Transaction = require('../models/transaction.model')


const executeTransaction = async (req, res, next) => {
    const user = req.user
    const userAccount = req.user.account
    const amountToTransfer = req.body.amountToTransfer
    const targetAccountId = req.body.targetAccountId

    const bankComission = amountToTransfer > 1000 ? 0.005 : 0.01;
    const totalTransfer = amountToTransfer + amountToTransfer * bankComission;


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


        req.transaction = transaction
        next()
    } catch (e) {

    }


}


const undoTransaction = (req, res, next) => {
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