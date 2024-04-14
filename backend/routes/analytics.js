const express = require('express');
const {
  outgoingsPastWeek,
  spendByCategoryPastWeek,
  statCards,
} = require('../controllers/analyticsController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.get('/outgoingsPastWeek', outgoingsPastWeek);
router.get('/spendByCategoryPastWeek', spendByCategoryPastWeek);
router.get('/statCards', statCards);

module.exports = router;
