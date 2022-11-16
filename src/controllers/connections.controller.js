const { default: mongoose } = require('mongoose');
const Connection = require('../models/connection.model')

const requestConnection = async (req, res, next) => {
    const userOneID = req.user._id;
    const accountOneId = req.user.account.accountId;

    // const accountOneId = req.body.accountOneId
    const accountTwoId = req.body.accountId

    if (!accountOneId || !accountTwoId) {
        return res.status(400).send({ error: 'Error with data entry' })
    }

    try {
        //First search if a connection is pending to accept 
        //from the other account, this is the contrary basically
        // const pendingConnection = await Connection.find({
        //     accountOneId: accountTwoId,
        //     accountTwoId: accountOneId
        // })

        // if (pendingConnection) {
        //     pendingConnection.userTwoId = userOneID
        //     pendingConnection.accountTwoConfirm = true
        //     await pendingConnection.save()
        //     return res.status(200).send({ info: 'There was a pending invitation from that account, it has been accepted!' })
        // }

        const connectionDuplicated = await Connection.findOne({
            $or: [
                { accountOneId: accountOneId, accountTwoId: accountTwoId },
                { accountOneId: accountTwoId, accountTwoId: accountOneId }
            ],
        })

        if (connectionDuplicated && connectionDuplicated.accountTwoConfirm) {
            return res.status(200).send({ info: "Accounts already linked" })
        }

        if (connectionDuplicated && !connectionDuplicated.accountTwoConfirm) {
            connectionDuplicated.userTwoId = userOneID
            connectionDuplicated.userTwoConfirm = true

            await connectionDuplicated.save()

            return res.status(201).send({
                info: 'There was a pending invitation from that account, it has been accepted!'
            })
        }

        //If there are no pending invitations from that account, create a new one
        const connection = new Connection({
            userOneId: userOneID,
            accountOneId: accountOneId,
            accountTwoId: accountTwoId
        });
        await connection.save();

        console.info('Connection created: ', connection)
        res.status(201).send(connection)

    } catch (e) {
        console.error("Error creating a new connection: ", e)
        res.status(500).send()
    }
}

const getPendingConnections = async (req, res, next) => {
    const accountId = req.user.account.accountId

    const pendingConnections = await Connection.find({
        $and: [
            { accountTwoId: accountId },
            { accountTwoConfirm: false }
        ]
    })

    return res.status(200).send(pendingConnections)
}

const acceptConnection = async (req, res, next) => {
    const user = req.user
    const connection_id = req.params.connection_id

    if (!mongoose.Types.ObjectId.isValid(connection_id)) {
        return res.status(400).send({ error: 'Invalid connection_id' })
    }

    try {
        const pendingConnection = await Connection.findOne({
            _id: connection_id
        })
        if (!pendingConnection || pendingConnection.accountTwoConfirm) {
            return res.status(404).send({ error: 'No pending invitations were found' })
        }

        pendingConnection.userTwoId = req.user._id
        pendingConnection.accountTwoConfirm = true

        console.log(pendingConnection)
        await pendingConnection.save()

        return res.status(200).send({ info: 'Invitation accepted' })
    } catch (e) {
        console.error("Error accepting invitation: ", e)
    }

    console.log(user, connection_id)
    return res.status(200).send({ info: "Connection accepted" })
}

const getAllAvailableConnections = async (req, res, next) => {

    const user = req.user

    try {
        const availableConnections = await Connection.find({
            $or: [
                { accountOneId: user.account.accountId },
                { accountTwoId: user.account.accountId }
            ],
            accountTwoConfirm: true
        })
        .populate('userOneId')
        .populate('userTwoId')

        //Show only the other user's information and clear sensitive data
        availableConnections.map(connection => {
            if (connection.userOneId._id === user._id) {
                connection.userOneId = undefined
                connection.userTwoId['tokens'] = undefined
                connection.userTwoId['password'] = undefined

            } else {
                connection.userTwoId = undefined
                connection.userOneId['tokens'] = undefined
                connection.userOneId['password'] = undefined
            }
        });

        res.status(200).send(availableConnections)

    } catch (e) {
        console.error("Error retrieving connections: ", e)
    }
}


module.exports = {
    getAllAvailableConnections,
    getPendingConnections,
    requestConnection,
    acceptConnection
}