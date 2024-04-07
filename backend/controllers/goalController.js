const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');

// Utility function to handle not found errors more efficiently
const handleNotFound = (res, entity = 'Resource') =>
  res.status(404).json({ error: `${entity} not found` });

exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).populate('goalCategory');
    res.status(200).json(goals);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch goals' });
  }
};

exports.getSingleGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findById(id).populate('goalCategory');
    if (!goal) return handleNotFound(res, 'Goal');
    res.status(200).json(goal);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch goal' });
  }
};

exports.createGoal = async (req, res) => {
  const { categoryId, goalType, goalTarget, goalDeadline } = req.body;

  try {
    // Ensure the category belongs to the user
    const category = await Category.findOne({ _id: categoryId, user: req.user._id });
    if (!category) return handleNotFound(res, 'Category');

    const goal = new Goal({
      user: req.user._id,
      goalCategory: categoryId,
      goalType: goalType.toLowerCase(),
      goalTarget,
      goalDeadline,
      goalStatus: 'underfunded',
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create goal' });
  }
};

exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  const { goalType, goalTarget, goalDeadline } = req.body;

  try {
    const goal = await Goal.findById(id).populate('goalCategory');
    if (!goal) return handleNotFound(res, 'Goal');

    // Update goal properties
    goal.goalType = goalType.toLowerCase();
    goal.goalTarget = goalTarget;
    goal.goalDeadline = goalDeadline ? new Date(goalDeadline) : undefined;

    // Re-evaluate the goal's status
    let isFunded = false;
    const currentAssigned = goal.goalCategory.categoryAssigned;

    switch (goal.goalType) {
      case 'deadline':
        if (goal.goalDeadline && new Date(goal.goalDeadline) >= new Date()) {
          isFunded = currentAssigned >= goal.goalTarget;
        }
        break;
      case 'target':
        isFunded = currentAssigned >= goal.goalTarget;
        break;
      case 'minimum':
        isFunded = currentAssigned >= goal.goalTarget;
        break;
      default:
        console.warn('Unknown goal type:', goal.goalType);
    }

    goal.goalStatus = isFunded ? 'funded' : 'underfunded';

    await goal.save();
    res.status(200).json({ message: 'Goal updated successfully', goal });
  } catch (err) {
    console.error('Error updating goal:', err);
    res.status(400).json({ error: 'Failed to update goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findByIdAndDelete(id);
    if (!goal) return handleNotFound(res, 'Goal');
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete goal' });
  }
};
