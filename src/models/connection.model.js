const {mongoose, Schema} = require('mongoose');

const connectionnSchema = new mongoose.Schema({
    userOneId: {
        type: Schema.Types.ObjectId, ref:'User'
    },
    accountOneId: {
        type: String,
        required: true,
        trim: true
    },
    userTwoId: {
        type: Schema.Types.ObjectId, ref:'User'
    },
    accountTwoId: {
        type: String,
        required: true,
        trim: true
    },
    accountTwoConfirm: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    autoIndex: true
});

const Connection = mongoose.model('Connection', connectionnSchema);
module.exports = Connection;