const express = require('express');
const router = express.Router();
const Transaction = require('../models/transactionModel');
const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
} = require('../controllers/transactionController');

// Transaction routes
router.get('/', getAllTransactions);
router.get('/:id', getSingleTransaction);
router.post('/', createTransaction);
router.delete('/:id', deleteSingleTransaction);
router.patch('/:id', updateSingleTransaction);

module.exports = router;
