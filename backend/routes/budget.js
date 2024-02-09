const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  moveMoneyBetweenCategories,
  assignMoneyToCategory,
  removeMoneyFromCategory,
  getAvailableFunds
} = require('../controllers/budgetController');

const router = express.Router();

router.use(requireAuth);

router.post('/move', moveMoneyBetweenCategories); 
router.post('/assign', assignMoneyToCategory); 
router.post('/remove', removeMoneyFromCategory); 
router.get('/available-funds', getAvailableFunds); 

module.exports = router;

