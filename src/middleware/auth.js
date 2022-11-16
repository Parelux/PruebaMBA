const User = require("../models/user.model");
const jwt = require('jsonwebtoken');

/**
 * Middleware to check authentication
 * 1-Acquire the token from header
 * 2-Verify the token is succesfully decoded using the secret key, and is not expired
 * 3-Find the user with the decoded id contained in token payload
 * 4-If user is found(Admin or not), success, call next(), if not, return authentication error
 */
const authMW = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')

        // const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        let decoded = undefined;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch(err) {
            return res.status(400).send({ error: 'Token invalid, try to generate a new one.' })
        }
        
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        .populate('account')
        if (!user) {
            return res.status(400).send({ error: 'User not found' })
        }

        req.token = token
        req.user = user
        next()

    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

const isAdmin = async (req, res, next) => {
    if(!req.user.isAdmin){
        return res
               .status(401)
               .send({ error: 'Only administrators can access this section' })
    }
    next()
}

module.exports = {authMW, isAdmin}

