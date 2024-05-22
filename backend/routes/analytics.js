const express = require('express');
const {
  statCards,
  lastFiveTransactions,
  dailySpendLastWeek,
  spendByCategoryAllTime,
  availableToSpend,
  accountBalances,
} = require('../controllers/analyticsController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.get('/statCards', statCards);
router.get('/lastFiveTransactions', lastFiveTransactions);
router.get('/dailySpendLastWeek', dailySpendLastWeek);
router.get('/spendByCategoryAllTime', spendByCategoryAllTime);
router.get('/availableToSpend', availableToSpend);
router.get('/accountBalances', accountBalances);

module.exports = router;
