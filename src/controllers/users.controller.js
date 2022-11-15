const User = require("../models/user.model");

/**
 * Create a new user with token and a new account
 */
const createUser = async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()

        const token = await user.generateAuthToken()
        const account = await user.generateNewAccount();

        res.status(201).send({ user, account, token })
    } catch (e) {
        res.status(400).send(e)
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
        const userAccount = await Account.find({ _id: account_id })
        if (!userAccount) {
            return res.status(404).send({ error: "The account number is invalid" })
        }

        const user_id = userAccount.userId.toString();
        const user = await User.findByCredentials(user_id, password);
        const token = await user.generateAuthToken();

        res.send({ user, token })

    } catch (e) {
        res.status(401).send({ error: e })
    }
}

module.exports = {
    createUser,
    login
}



