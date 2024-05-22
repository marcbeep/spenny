const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  getAllGoals,
  getSingleGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllGoals);
router.get('/:id', getSingleGoal);
router.patch('/:id', updateGoal);
router.post('/', createGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
