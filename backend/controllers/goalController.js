const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');
const { checkOwnership } = require('../utils/utils');

const handleNotFound = (res, entity = 'Resource') =>
  res.status(404).json({ error: `${entity} not found` });

exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).populate('goalCategory');
    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(400).json({ error: 'Failed to fetch goals' });
  }
};

exports.getSingleGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findById(id).populate('goalCategory');
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    if (!checkOwnership(goal, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to access this goal' });
    }
    res.status(200).json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(400).json({ error: 'Failed to fetch goal' });
  }
};

exports.createGoal = async (req, res) => {
  const { categoryId, goalType, goalTarget, goalResetDay } = req.body;

  try {
    const category = await Category.findOne({ _id: categoryId, user: req.user._id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if the category already has a goal associated with it
    if (category.categoryGoal) {
      return res.status(400).json({
        error: 'This category already has a goal. Only one goal per category is allowed.',
      });
    }

    const newGoal = {
      user: req.user._id,
      goalCategory: categoryId,
      goalType: goalType.toLowerCase(),
      goalTarget: goalTarget,
      goalStatus: 'underfunded',
    };

    // Conditionally set goalResetDay for 'spending' goals
    if (goalType.toLowerCase() === 'spending') {
      newGoal.goalResetDay = goalResetDay;
    }

    const goal = await new Goal(newGoal).save();

    // Update the category with the new goal's ID
    category.categoryGoal = goal._id;
    await category.save();

    // Optionally, we can return the updated category in the response
    // to verify that the categoryGoal has been updated correctly.
    await checkAndUpdateGoalStatus(goal._id);
    res.status(201).json({ goal, category });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(400).json({ error: 'Failed to create goal' });
  }
};

exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  const { goalTarget } = req.body;  // Accept only goalTarget in the request

  try {
    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (!checkOwnership(goal, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to update this goal' });
    }

    // Update the goalTarget as it's the only allowed update
    goal.goalTarget = goalTarget;

    // Save the goal and update the status accordingly
    await goal.save();
    await checkAndUpdateGoalStatus(id);

    res.status(200).json({ message: 'Goal updated successfully', goal });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(400).json({ error: 'Failed to update goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (!checkOwnership(goal, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to delete this goal' });
    }

    // Before removing the goal, unset the categoryGoal field in the associated category
    await Category.findByIdAndUpdate(goal.goalCategory, { $unset: { categoryGoal: '' } });

    await Goal.deleteOne({ _id: id });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(400).json({ error: 'Failed to delete goal' });
  }
};
