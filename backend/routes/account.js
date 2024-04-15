const express = require('express');
const {
  addAccount,
  archiveAccount,
  updateAccount,
  getAccounts,
  getAccount,
  moveMoneyBetweenAccounts,
  getSpendingBalance
} = require('../controllers/accountController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.get('/getSpendingBalance', getSpendingBalance);
router.patch('/:id', updateAccount);
router.post('/', addAccount);
router.post('/moveMoney', moveMoneyBetweenAccounts);
router.post('/archive/:id', archiveAccount);

module.exports = router;
