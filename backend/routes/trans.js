const express = require('express')

const router = express.Router()

const Transaction = require('../models/transModel')

const {
    createTransaction, 
    getAllTransactions, 
    getSingleTransaction
} = require('../controllers/transController')

// Get all
router.get('/', getAllTransactions)

// Get single
router.get('/:id', getSingleTransaction)

// Post new
router.post('/', createTransaction)

// Delete single
router.delete('/', (req, res) => {
    res.json({mssg: 'DELETE single trans'})
})

// Patch single
router.patch('/:id', (req, res) => {
    res.json({mssg: 'PATCH single trans'})
})

module.exports = router