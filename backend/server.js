require('dotenv').config()

const express = require('express')

const mongoose = require('mongoose')

const transRoutes = require('./routes/trans')

// express app

const app = express()

// middleware

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes 

app.use('/api/trans', transRoutes)

// connect to mongodb & listen for requests

mongoose.connect(process.env.MONGO_URI)
    .then(() => {    
        console.log('Connected to MongoDB')
        app.listen(process.env.PORT, () => {
            console.log('Listening on Port ' + process.env.PORT)
        }) 
    })
    .catch(err => {
        console.log(err)
    })
