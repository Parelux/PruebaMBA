const { mongoose } = require('mongoose');

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
    },
    pending: {
        type: Boolean,
        default: true
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    error: {
        type: Boolean,
        default: false
    },
    errorDescription: {
        type: String,
    }
}, {
    timestamps: false,
    autoIndex: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
