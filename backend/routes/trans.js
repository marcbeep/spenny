const express = require('express')

const router = express.Router()

// Get all
router.get('/', (req, res) => {
    res.json({mssg: 'GET all trans'})
})

// Get single
router.get('/:id', (req, res) => {
    res.json({mssg: 'GET single trans'})
})

// Post new
router.post('/', (req, res) => {
    res.json({mssg: 'POST new trans'})
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