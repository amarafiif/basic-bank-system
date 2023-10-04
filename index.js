const express = require('express')
const app = express()

require('dotenv').config()

const PORT = process.env.PORT || 3000
const router = require('./routers')


app.use(express.json({ strict:false }))
app.use('/api/v1/', router)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})