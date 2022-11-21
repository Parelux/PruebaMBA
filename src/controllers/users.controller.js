const Account = require("../models/account.model");
const User = require("../models/user.model");

/**
 * Create a new user with token and a new account
 */
const createUser = async (req, res) => {
    const user = new User(req.body)
    const balance = req.body.balance

    if (!balance || balance <= 0)
        return res.status(400).send({ error: 'Bad data entry, balance has to be positive or zero' })

    try {
        //This is becouse of the password obfuscation upon save.
        const password = await User.generateSecurePassword();
        user.password = password;

        const token = await user.generateAuthToken()
        const account = await user.generateNewAccount(balance);

        await user.save()

        //Put the real password for the user to use it
        user.password = password

        //Join the account and hide some fields to avoid confussions
        user.isAdmin = undefined
        user.tokens = undefined

        return res.status(201).send({ user: user, access_token: token, user_account: account })
    } catch (e) {
        return res.status(500).send({ error: 'Error creating user: ' + e })
    }
}

/**
 * Perform a login with valid user credentials
 * It requires a valid account number and password
 */
const login = async (req, res) => {
    const accountId = req.body.accountId ? req.body.accountId : undefined;
    const password = req.body.password ? req.body.password : undefined;

    if (!accountId || !password) {
        return res.status(400).send({ error: "Bad user data entry." })
    }
    try {
        const account = await Account.findByAccountIdAndPass(accountId, password);
        const token = await account.user.generateAuthToken();

        //Hide some fields to avoid confussions
        account.user.isAdmin = undefined
        account.user.password = undefined
        account.user.tokens = undefined

        return res.send({ user: account.user, account: account, access_token: token })

    } catch (e) {
        console.error("Error login user: ", e)
        return res.status(401).send({ error: e })
    }
}

module.exports = {
    createUser,
    login
}



