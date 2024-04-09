const express = require('express');
const Transaction = require('../models/transactionModel');
const requireAuth = require('../middleware/requireAuth');
const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
  ai,
} = require('../controllers/transactionController');

const router = express.Router();
router.use(requireAuth);

router.get('/', getAllTransactions);
router.get('/:id', getSingleTransaction);
router.post('/', createTransaction);
router.post('/ai', ai);
router.patch('/:id', updateSingleTransaction);
router.delete('/:id', deleteSingleTransaction);

module.exports = router;
