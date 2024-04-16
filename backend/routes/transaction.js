const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
  ai,
  transactionTable,
  getCategoryAndAccountNames,
} = require('../controllers/transactionController');

const router = express.Router();
router.use(requireAuth);

router.get('/getCategoryAndAccountNames', getCategoryAndAccountNames);
router.get('/transactionTable', transactionTable);
router.get('/', getAllTransactions);
router.get('/:id', getSingleTransaction);
router.post('/', createTransaction);
router.post('/ai', ai);
router.patch('/:id', updateSingleTransaction);
router.delete('/:id', deleteSingleTransaction);

module.exports = router;
