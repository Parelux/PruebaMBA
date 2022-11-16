const { mongoose, Schema } = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    user: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    }
}, {
    timestamps: true,
    autoIndex: true
});

accountSchema.methods.getAmountFromAccount = async function (amount) {
    const account = this
    try {
        account.balance = account.balance - amount
        if (account.balance < 0) {
            throw new Error('Insufficient balance in account for the operation')
        }
        await account.save()
        return
    } catch (e) {
        throw new Error('Error while extracting ' + amount + ' from account: ', account)
    }
}

accountSchema.methods.transferMoneyToAccount = async function (amount) {
    const account = this
    try {
        account.balance = account.balance + amount
        await account.save()
        return
    } catch (e) {
        throw new Error('Error while adding money to the target account: ', account, amount)
    }
}

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
