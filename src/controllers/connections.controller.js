const Connection = require('../models/connection.model')

const getAllAvailableConnections = (req, res, next) => {
    res.status(404).send('Not implemented')
}

const getPendingConnections = async (req, res, next) => {
    res.status(404).send('Not implemented')
}

const requestConnection = async (req, res, next) => {
    const userOneId = req.body.userOneId
    const userTwoId = req.body.userTwoId

    try {
        const connection = new Connection({
            userOneId: userOneId,
            userTwoId: userTwoId
        });
        await connection.save();

        console.info('Connection created: ', connection)
        res.status(201).send(connection)

    } catch (error) {
        console.error(error)
        res.status(500).send()
    }
}

const acceptConnection = async (req, res, next) => {
    res.status(404).send('Not implemented')
}


module.exports = {
    getAllAvailableConnections,
    getPendingConnections,
    requestConnection,
    acceptConnection
}