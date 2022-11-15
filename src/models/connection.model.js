const {mongoose} = require('mongoose');

const connectionnSchema = new mongoose.Schema({
    userOneId: {
        type: String,
        required: true,
        trim: true
    },
    userOneConfirm: {
        type: Boolean,
        default: true,
    },
    UserTwoId: {
        type: String,
        required: true,
        trim: true
    },
    userTwoConfirm: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    autoIndex: true
});

const Connection = mongoose.model('Connection', connectionnSchema);
module.exports = Connection;