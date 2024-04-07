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
router.post('/', createGoal);
router.patch('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
