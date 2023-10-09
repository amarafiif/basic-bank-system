const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const accountController = require('./controllers/accountController')

router.get('/', (req, res) => {
    return res.json({
        message: "Hello World!"
    })
})

// Route users
router.post('/users', userController.registerUser)
router.get('/users', userController.getUsers)
router.get('/users/:id', userController.getUserDetails)

// Route bank_accounts
router.post('/accounts', accountController.createAccount)
router.get('/accounts', accountController.listAccounts)
router.get('/accounts/:id', accountController.getAccountDetail)


module.exports = router