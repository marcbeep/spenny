const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');

// Utility function to handle not found errors more efficiently
const handleNotFound = (res, entity = 'Goal') => res.status(404).json({ error: `${entity} not found` });

exports.createGoal = async (req, res) => {
  const { goalCategory, goalType, goalTarget, goalDeadline } = req.body;

  try {
    // Ensure the category exists for the user
    const categoryExists = await Category.exists({ _id: goalCategory, user: req.user._id });
    if (!categoryExists) return handleNotFound(res, 'Category');

    const goal = await Goal.create({
      user: req.user._id,
      goalCategory,
      goalType: goalType.toLowerCase(),
      goalTarget,
      goalCurrent: 0, // Initialized to 0 upon creation
      goalDeadline,
      goalStatus: 'underfunded', // Default status on creation
    });

    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create goal' });
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

exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const goal = await Goal.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!goal) return handleNotFound(res);

    res.status(200).json(goal);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update goal' });
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
