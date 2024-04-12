const express = require('express');
const {
  networthPastWeek,
  outgoingsPastWeek,
  spendByCategoryPastWeek,
  allTimeAnalytics,
} = require('../controllers/analyticsController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.get('/networthPastWeek', networthPastWeek);
router.get('/outgoingsPastWeek', outgoingsPastWeek);
router.get('/spendByCategoryPastWeek', spendByCategoryPastWeek);
router.get('/allTimeAnalytics', allTimeAnalytics);

module.exports = router;
