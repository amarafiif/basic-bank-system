const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const bankAccountController = require('./controllers/bankAccountController')
const bankTransactionsController = require('./controllers/bankTransactionsController')


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
router.post('/accounts', bankAccountController.createAccount)
router.get('/accounts', bankAccountController.listAccounts)
router.get('/accounts/:id', bankAccountController.getAccountDetail)

// Route transactions
router.post('/transactions', bankTransactionsController.createTransaction)
router.get('/transactions', bankTransactionsController.listTransactions)
router.get('/transactions/:id', bankTransactionsController.getTransactionDetails)

module.exports = router