const express = require('express');
const {
  statCards,
  lastFiveTransactions,
  outgoingsPastWeek,
  spendByCategoryPastWeek,
} = require('../controllers/analyticsController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.get('/statCards', statCards);
router.get('/lastFiveTransactions', lastFiveTransactions);
router.get('/outgoingsPastWeek', outgoingsPastWeek);
router.get('/spendByCategoryPastWeek', spendByCategoryPastWeek);

module.exports = router;
