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

router.post('/assign', assignMoneyToCategory); 
router.post('/move', moveMoneyBetweenCategories); 
router.post('/remove', removeMoneyFromCategory); 
router.get('/readyToAssign', readyToAssign); 

module.exports = router;

