const express = require('express')

const router = express.Router()

const Transaction = require('../models/transModel')

// Get all
router.get('/', (req, res) => {
    res.json({mssg: 'GET all trans'})
})

// Get single
router.get('/:id', (req, res) => {
    res.json({mssg: 'GET single trans'})
})

// Post new
router.post('/', async (req, res) => {
    const {title, amount} = req.body
    
    try{
        const newTrans = await Transaction.create({
            title,
            amount
        })
        return res.status(200).json(newTrans)
    }catch(err){
        res.status(400).json({error: err.message})
    }
})

// Delete single
router.delete('/', (req, res) => {
    res.json({mssg: 'DELETE single trans'})
})

// Patch single
router.patch('/:id', (req, res) => {
    res.json({mssg: 'PATCH single trans'})
})

module.exports = router