const express = require('express')
const path = require('path');
var morgan = require('morgan')
const { connectToDatabase } = require('./db/mongoose')
const usersRouter = require('./routers/users')
const transactionsRouter = require('./routers/transactions');
const transferService = require('./services/transferService')

const app = express()

//Server config
app.use(express.json())

//Server routing
app.use(usersRouter)
app.use(transactionsRouter)

//Use historical folder to save transactions csv file
app.use(express.static(path.join(__dirname, 'historical')));

//Setup logs with morgan
app.use(morgan('combined'))

//Connect to database, or exit application
connectToDatabase().then(async () => {
    console.log("Success connecting to mongoDB database!")

    //Run cron job to execute pending transactions (period T defined in envFile)
    transferService.startTransferService()

}).catch((e) => {
    console.error("Error connecting to mongoDB database: ", e)
    console.error("Aborting execution...")
    process.exit()
})

app.get('/', function (req, res) {
    res.send({ app: "Social Banking, MBA Test" })
})

module.exports = app