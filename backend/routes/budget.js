const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  moveMoneyBetweenCategories,
  assignMoneyToCategory,
  removeMoneyFromCategory,
  readyToAssign,
  addFundsToCategory,
  removeFundsFromCategory,
} = require('../controllers/budgetController');

const router = express.Router();

router.use(requireAuth);

router.post('/move', moveMoneyBetweenCategories); 
router.post('/assign', assignMoneyToCategory); 
router.post('/remove', removeMoneyFromCategory); 
router.get('/readyToAssign', readyToAssign); 
router.post('/addFunds', addFundsToCategory);
router.post('/removeFunds', removeFundsFromCategory);

module.exports = router;

