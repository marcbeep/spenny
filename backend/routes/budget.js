const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  moveMoneyBetweenCategories,
  assignMoneyToCategory,
  removeMoneyFromCategory,
  readyToAssign,
} = require('../controllers/budgetController');

const router = express.Router();

router.use(requireAuth);

router.get('/readyToAssign', readyToAssign);
router.post('/assignToCategory', assignMoneyToCategory);
router.post('/moveBetweenCategories', moveMoneyBetweenCategories);
router.post('/removeFromCategories', removeMoneyFromCategory);

module.exports = router;
