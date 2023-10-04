const express = require('express')
const router = express.Router()
const userRegister = require('./controllers/userController')
const userController = require('./controllers/userController')

router.get('/', (req, res) => {
    return res.json({
        message: "Hello World!"
    })
})

// routers.post('users', userController.registerUser)

module.exports = router