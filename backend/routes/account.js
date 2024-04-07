const express = require('express');
const {
  addAccount,
  deleteAccount,
  updateAccount,
  getAccounts,
  moveMoneyBetweenAccounts
} = require('../controllers/accountController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.post('/', addAccount);
router.get('/', getAccounts);
router.delete('/:id', deleteAccount);
router.patch('/:id', updateAccount);
router.post('/moveMoney', moveMoneyBetweenAccounts);

module.exports = router;
