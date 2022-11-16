const express = require('express')
const path = require('path');
const { connectToDatabase } = require('./db/mongoose')
var morgan = require('morgan')
const usersRouter = require('./routers/users')
const transactionsRouter = require('./routers/transactions')

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
connectToDatabase().then((result) => {
    console.log("Success connecting to mongoDB database!")
}).catch((e) => {
    console.error("Error connecting to mongoDB database: ", e)
    console.error("Aborting execution...")
    process.exit()
})

app.get('/', function (req, res) {
    res.send({app: "Social Banking, MBA Test"})
})

module.exports = app