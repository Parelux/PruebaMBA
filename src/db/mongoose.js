const mongoose = require('mongoose')


const connectToDatabase = async () => {
    return mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
    })
}

const disconnectDatabase = async () => {
    return mongoose.disconnect();
}

module.exports = {
    connectToDatabase,
    disconnectDatabase
}