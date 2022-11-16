const { mongoose, Schema } = require('mongoose');
const Account = require('./account.model');

const transactionSchema = new mongoose.Schema({
    originAccountId: {
        type: String,
        required: true,
        trim: true
    },
    targetAccountId: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
    },
    timeStamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    autoIndex: true
});

transactionSchema.methods.getAmountFromAccount = async function (originAccount, amount) {
    const transaction = this
    try {
        originAccount.balance = originAccount.balance - amount
        await originAccount.save()
        return
    } catch (e) {
        throw new Error('Error while extracting money in the origin account: ',originAccount)
    }
}

/**
 * 
 * @param {*} targetAccount 
 * @param {*} amount 
 * @returns 
 */
transactionSchema.methods.transferMoneyToAccount = async function (targetAccount, amount) {
    const transaction = this
    try {
        targetAccount.balance = targetAccount.balance + amount
        await targetAccount.save()
        return
    } catch (e) {
        throw new Error('Error while adding money to the target account: ',targetAccount, amount)
    }
}

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
