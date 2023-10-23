const express = require('express')
const app = express()

require('dotenv').config()

const PORT = process.env.PORT || 3000
const router = require('./routers')
const swaggerUi = require('swagger-ui-express')
const swaggerJson = require('./openapi.json')

app.use(express.json({ strict : false}))

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerJson))
app.use('/api/v1', router)

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})