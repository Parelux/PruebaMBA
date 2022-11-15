const { mongoose, Schema } = require('mongoose');
const ShortUniqueId = require('short-unique-id');

const accountSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userId: {
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

// /**
//  * PRE save, Generate an unique ID for the account
//  */
// accountSchema.pre('save', async function (next) {
//     const account = this

//     const uid = new ShortUniqueId({ length: 10 });
//     account.accountId = uid();

//     next()
// })

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
