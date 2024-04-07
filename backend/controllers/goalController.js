const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');

// Utility function to handle not found errors more efficiently
const handleNotFound = (res, entity = 'Goal') =>
  res.status(404).json({ error: `${entity} not found` });

exports.createOrUpdateGoalForCategory = async (req, res) => {
  const { category: categoryId, goalType, goalTarget, goalDeadline } = req.body;

  try {
    const categoryExists = await Category.exists({ _id: categoryId, user: req.user._id });
    if (!categoryExists) return handleNotFound(res, 'Category');

    // Check if the category already has a goal
    let goal = await Goal.findOne({ goalCategory: categoryId });
    if (goal) {
      // Update the existing goal
      goal.goalType = goalType.toLowerCase();
      goal.goalTarget = goalTarget;
      goal.goalDeadline = goalDeadline;
      goal.goalStatus = 'underfunded'; // Reset status on goal update
    } else {
      // Create a new goal
      goal = new Goal({
        user: req.user._id,
        goalCategory: categoryId,
        goalType: goalType.toLowerCase(),
        goalTarget,
        goalDeadline,
        goalStatus: 'underfunded', // Default status for new goals
      });
    }

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create or update goal' });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    res.status(200).json(goals);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch goals' });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findByIdAndDelete(id);
    if (!goal) return handleNotFound(res);

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete goal' });
  }
};
