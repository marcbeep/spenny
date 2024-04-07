const Category = require('../models/categoryModel');
const Transaction = require('../models/transactionModel');
const Goal = require('../models/goalModel');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');
const mongoose = require('mongoose');

// Shared error handling for simplicity and DRY principles
const handleNoCategoryFound = (res) => res.status(404).json({ error: 'Category not found' });

exports.addCategory = async (req, res) => {
  const { title } = req.body; // Accepting title from request body

  try {
    const category = await Category.create({
      user: req.user._id,
      categoryTitle: title.toLowerCase(), // Ensure lowercase for consistency
      categoryAssigned: 0,
      categoryAvailable: 0,
      categoryActivity: 0,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort('categoryTitle'); // Sort by title for better organization
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch categories' });
  }
};

exports.getSingleCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const category = await Category.findById(id);
    if (!category) return handleNoCategoryFound(res);
    res.status(200).json(category);
  } catch (err) {
    handleNoCategoryFound(res);
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { newCategoryId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(newCategoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const newCategory = await Category.findById(newCategoryId);
    if (!newCategory) {
      return res.status(404).json({ error: 'New category not found' });
    }

    await Transaction.updateMany(
      { transactionCategory: id },
      { transactionCategory: newCategoryId },
    );

    await Goal.findOneAndDelete({ goalCategory: id });
    await Category.findByIdAndDelete(id);

    // Call to check and update goal status for the new category's goal, if it exists
    const newCategoryGoal = await Goal.findOne({ goalCategory: newCategoryId });
    if (newCategoryGoal) {
      await checkAndUpdateGoalStatus(newCategoryGoal._id);
    }

    res.sendStatus(204); // No content to send back for a delete operation
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category and reassign transactions' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { categoryTitle: title.toLowerCase() },
      { new: true },
    );

    if (!updatedCategory) return handleNoCategoryFound(res);

    // After updating the category, check and update goal status related to this category
    const relatedGoal = await Goal.findOne({ goalCategory: updatedCategory._id });
    if (relatedGoal) {
      await checkAndUpdateGoalStatus(relatedGoal._id);
    }

    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category' });
  }
};
