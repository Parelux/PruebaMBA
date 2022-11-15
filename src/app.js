const express = require('express')
const path = require('path');
const { connectToDatabase } = require('./db/mongoose')
const usersRouter = require('./routers/users')
const transactionsRouter = require('./routers/transactions')


const app = express()

//Server config
app.use(express.json())

//Connect to database
connectToDatabase().then((result) => {
    console.log("Success connecting to mongoDB database!", result)
}).catch((e) => {
    console.error("Error connecting to mongoDB database: ", e)
    console.error("Aborting execution...")
    process.exit()
})

//Use historical folder to save transactions csv file
app.use(express.static(path.join(__dirname, 'historical')));

//Server routing
app.use(usersRouter)
app.use(transactionsRouter)

module.exports = app