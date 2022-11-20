const { mongoose, Schema } = require('mongoose');
const bcrypt = require('bcryptjs');


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
        required: false
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

/**
 * Helper function to perform the login operation
 * @param {*} user_id 
 * @param {*} password 
 * @returns {user}
 */
 accountSchema.statics.findByAccountIdAndPass = async (account_id, password) => {
    
    const account = await Account.findOne({ accountId: account_id })
    .populate('user')

    if (!account) {
        throw new Error('Unable to login, account not found.')
    }
    if (!account.user) {
        throw new Error('Unable to login, user not found.')
    }

    const isMatch = await bcrypt.compare(password, account.user.password)
    if (!isMatch) {
        throw new Error('Unable to login, Password incorrect.')
    }

    return account
}

/**
 * Extract @param amount from account
 * @param {*} amount 
 * @returns 
 */
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

/**
 * Transfer @param amount to account
 * @param {*} amount 
 * @returns 
 */
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

//Update the account with latest data
accountSchema.methods.getLatest = function() {
    return this.model('Account').findById(this.id);
};

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
