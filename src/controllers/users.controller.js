const User = require("../models/user.model");
const Account = require("../models/account.model")

/**
 * Create a new user with token and a new account
 */
const createUser = async (req, res) => {
    const user = new User(req.body)
    const balance = req.body.balance
    try {
        const password = await User.generateSecurePassword();
        user.password = password;

        const token = await user.generateAuthToken()
        const account = await user.generateNewAccount(balance);
        
        await user.save()
        res.status(201).send({ user, password, account, token })
    } catch (e) {
        res.status(400).send({error: 'Error creating user: '+e})
    }
}

/**
 * Perform a login with valid user credentials
 * It requires a valid account number and password
 */
const login = async (req, res) => {
    const account_id = req.body.accountId ? req.body.accountId : undefined;
    const password = req.body.password ? req.body.password : undefined;

    if (!account_id || !password) {
        return res.status(400).send({ error: "Bad user data entry." })
    }
    try {
        const user = await User.findByAccountID(account_id, password);
        const token = await user.generateAuthToken();

        res.send({ user, token })

    } catch (e) {
        console.error("Error login user: ", e)
        res.status(401).send({ error: e })
    }
}

module.exports = {
    createUser,
    login
}



