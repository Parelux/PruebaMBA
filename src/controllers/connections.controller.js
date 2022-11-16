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
                connection.userTwoId['isAdmin'] = undefined
                connection.userTwoId['createdAt'] = undefined

            } else {
                connection.userTwoId = undefined
                connection.userOneId['tokens'] = undefined
                connection.userOneId['password'] = undefined
                connection.userOneId['isAdmin'] = undefined
                connection.userOneId['createdAt'] = undefined
            }
        });

        res.status(200).send(availableConnections)

    } catch (e) {
        console.error("Error retrieving connections: ", e)
    }
}

const removeConnectionOrInvitation = async (req, res, next) => {
    const user = req.user
    const connection_id = req.params.connection_id

    //Find a valid connection with the responsible user on it
    const connectionRemoved = await Connection.findOneAndDelete({
        _id: connection_id,
        $or: [
            { accountOneId: user.account.accountId },
            { accountTwoId: user.account.accountId }
        ]
    })

    if(!connectionRemoved){
        return res.status(404).send({
            info: 'The connection is already deleted'
        })
    }

    return res.status(200).send({removed: connectionRemoved})
}


module.exports = {
    getAllAvailableConnections,
    getPendingConnections,
    requestConnection,
    acceptConnection,
    removeConnectionOrInvitation
}