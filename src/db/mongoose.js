const mongoose = require('mongoose')

const connectToDatabase = async () => {
    return mongoose.connect(process.env.MONGODB_URI_ATLAS, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}

const disconnectDatabase = async () => {
    return mongoose.disconnect();
}

module.exports = {
    connectToDatabase,
    disconnectDatabase
}