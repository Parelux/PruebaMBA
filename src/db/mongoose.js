const mongoose = require('mongoose')


const connectToDatabase = async () => {
    return await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
    })
}

const disconnectDatabase = async () => {
    await mongoose.disconnect();
}

// mongoose.connect(process.env.MONGODB_URL, {
//     useNewUrlParser: true,
// }).then(() => {
//     console.log("Success connecting to mongoDB database!")
// }).catch(error => {
//     console.error("Error connecting to mongoDB database: ", error)
// })

module.exports = {
    connectToDatabase,
    disconnectDatabase
}