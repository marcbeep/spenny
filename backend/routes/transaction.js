const express = require('express');
const Transaction = require('../models/transactionModel');
const requireAuth = require('../middleware/requireAuth');
const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
} = require('../controllers/transactionController');

const router = express.Router();
router.use(requireAuth);

router.get('/', getAllTransactions);
router.get('/:id', getSingleTransaction);
router.post('/', createTransaction);
router.delete('/:id', deleteSingleTransaction);
router.patch('/:id', updateSingleTransaction);

module.exports = router;
