const mongoose = require('mongoose')


const connectToDatabase = async () => {
    return await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
    })
}

const disconnectDatabase = async () => {
    return await mongoose.disconnect();
}

module.exports = {
    connectToDatabase,
    disconnectDatabase
}