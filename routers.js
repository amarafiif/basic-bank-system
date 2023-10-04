const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')

router.get('/', (req, res) => {
    return res.json({
        message: "Hello World!"
    })
})

router.post('/users', userController.registerUser)
router.get('/users', userController.getUsers)
router.get('/users/:id', userController.getUserDetails)

module.exports = router