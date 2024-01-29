const express = require('express');

const cors = require('cors');

const router = express.Router();

const allowedOrigins = ['https://cash.reeflink.org', 'http://localhost:3000'];

router.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        var message =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  }),
);

const Transaction = require('../models/transModel');

const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
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
