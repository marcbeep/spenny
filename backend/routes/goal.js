const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
    createOrUpdateGoalForCategory,
    getGoal,
    deleteGoal,
} = require('../controllers/goalController');

const router = express.Router();

router.use(requireAuth);

router.post('/createUpdate', createOrUpdateGoalForCategory);
router.get('/getGoal', getGoal);
router.post('/deleteGoal', deleteGoal);

module.exports = router;