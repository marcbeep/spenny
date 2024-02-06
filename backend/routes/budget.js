const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  moveMoneyBetweenCategories,
  assignMoneyToCategory,
  removeMoneyFromCategory,
} = require('../controllers/budgetController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Routes for managing the budget
router.post('/move', moveMoneyBetweenCategories); // Moving money between categories
router.post('/assign', assignMoneyToCategory); // Assigning money to a category
router.post('/remove', removeMoneyFromCategory); // Removing money from a category

module.exports = router;

