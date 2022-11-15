const express = require('express')
const { authMW } = require('../middleware/auth')
const usersController = require('../controllers/users.controller')
const connectionsController = require('../controllers/connections.controller')

const router = new express.Router()

//Create a new user
router.post('/users', usersController.createUser )

//Perform a login operation using user credentials
router.post('/users/login', usersController.login )

//List all available connections
router.get('users/connections', authMW, connectionsController.getAllAvailableConnections)

//Send an invitation to another user using his ID
router.post('users/connections', authMW, connectionsController.requestConnection)

//Get pending invitations for this users
router.get('/users/connections/pending', authMW, connectionsController.getPendingConnections)

//Accept an invitation with ID :connection_id
router.post('/users/connections/accept/:connection_id', authMW, connectionsController.acceptConnection)


module.exports = router