const express = require('express');

const cors = require('cors');

const router = express.Router();

router.use(cors({
  origin: 'https://cash.reeflink.org'
}));

const Transaction = require('../models/transModel');

const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction
} = require('../controllers/transController');

// Get all
router.get('/', getAllTransactions);

// Get single
router.get('/:id', getSingleTransaction);

// Post new
router.post('/', createTransaction);

// Delete single
router.delete('/:id', deleteSingleTransaction);

// Patch single
router.patch('/:id', updateSingleTransaction);

module.exports = router;
