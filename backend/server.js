require('dotenv').config()

const express = require('express')
const transRoutes = require('./routes/trans')

const app = express()

// middleware

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes 

app.use('/api/trans', transRoutes)

// listening

app.listen(process.env.PORT, () => {
    console.log('Listening on Port ' + process.env.PORT)
}) 