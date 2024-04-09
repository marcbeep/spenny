const express = require('express');
const {
  calculateTotalSpend,
  calculateSpendingByCategory,
  calculateNetWorth,
  calculateIncomeVsExpenses,
  calculateSavingsRate,
  calculateAllTimeAnalytics,
} = require('../controllers/analyticsController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.get('/totalSpend', calculateTotalSpend);
router.get('/spendByCategory', calculateSpendingByCategory);
router.get('/networth', calculateNetWorth);
router.get('/incomeVsExpenses', calculateIncomeVsExpenses);
router.get('/savingsRate', calculateSavingsRate);
router.get('/alltime', calculateAllTimeAnalytics);

module.exports = router;
