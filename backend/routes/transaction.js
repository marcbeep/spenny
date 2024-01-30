const express = require('express');
const cors = require('cors');
const router = express.Router();
const Transaction = require('../models/transactionModel');
const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
} = require('../controllers/transactionController');

const allowedOrigins = ['https://spenny.reeflink.org', 'http://localhost:3000'];

router.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const message =
        'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(message), false);
    },
  })
);

router.get('/', getAllTransactions);
router.get('/:id', getSingleTransaction);
router.post('/', createTransaction);
router.delete('/:id', deleteSingleTransaction);
router.patch('/:id', updateSingleTransaction);

module.exports = router;

