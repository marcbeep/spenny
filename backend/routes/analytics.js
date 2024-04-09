/*
Here, define endpoints for fetching analytics data.

GET /analytics/total-spend
GET /analytics/spending-by-category
GET /analytics/net-worth
GET /analytics/income-vs-expenses
GET /analytics/savings-rate

Connect these endpoints to the corresponding functions in the analyticsController.
 */

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

router.get('/total-spend', calculateTotalSpend);
router.get('/spending-by-category', calculateSpendingByCategory);
router.get('/net-worth', calculateNetWorth);
router.get('/income-vs-expenses', calculateIncomeVsExpenses);
router.get('/savings-rate', calculateSavingsRate);
router.get('/all-time', calculateAllTimeAnalytics);

module.exports = router;
