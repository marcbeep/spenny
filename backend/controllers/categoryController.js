const Category = require('../models/categoryModel');
const Transaction = require('../models/transactionModel');
const Goal = require('../models/goalModel');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');
const { checkOwnership } = require('../utils/utils');
const mongoose = require('mongoose');

const handleNoCategoryFound = (res) => res.status(404).json({ error: 'Category not found' });

exports.addCategory = async (req, res) => {
  const { title } = req.body;

  try {
    const category = await Category.create({
      user: req.user._id,
      categoryTitle: title.toLowerCase(),
      // categoryAssigned: 0,
      categoryAvailable: 0,
      categoryActivity: 0,
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ error: 'Failed to create category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort('categoryTitle');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(400).json({ error: 'Failed to fetch categories' });
  }
};

exports.getSingleCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNotFound(res, 'Category');
  }

  try {
    const category = await Category.findById(id);
    if (!category) return handleNotFound(res, 'Category');
    if (!checkOwnership(category, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to access this category' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching single category:', error);
    handleNotFound(res, 'Category');
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

    if (!checkOwnership(category, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to delete this category' });
    }

    await Transaction.updateMany(
      { transactionCategory: id },
      { transactionCategory: newCategoryId },
    );

    await Goal.findOneAndDelete({ goalCategory: id });
    await Category.findByIdAndDelete(id);

    const newCategoryGoal = await Goal.findOne({ goalCategory: newCategoryId });
    if (newCategoryGoal) {
      await checkAndUpdateGoalStatus(newCategoryGoal._id);
    }

    res.status(200).json({ message: 'Category successfully deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
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

    if (!checkOwnership(updatedCategory, req.user._id)) {
      // Make sure to check using updatedCategory
      return res.status(403).json({ error: 'Unauthorized to modify this category' });
    }

    const relatedGoal = await Goal.findOne({ goalCategory: updatedCategory._id });
    if (relatedGoal) {
      await checkAndUpdateGoalStatus(relatedGoal._id);
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ error: 'Failed to update category' });
  }
};

exports.categoryTable = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id })
      .sort('categoryTitle')
      .populate({
        path: 'categoryGoal',
        select: 'goalType goalTarget goalStatus goalResetDay'
      });

    const result = categories.map(category => {
      // Format the goal description based on the type of goal
      let goalDescription = '';
      if (category.categoryGoal) {
        if (category.categoryGoal.goalType === 'spending') {
          goalDescription = `£${category.categoryGoal.goalTarget} by ${category.categoryGoal.goalResetDay}`;
        } else {
          goalDescription = `£${category.categoryGoal.goalTarget}`;
        }
      }

      return {
        categoryId: category._id,
        goalId: category.categoryGoal ? category.categoryGoal._id : null,
        categoryTitle: category.categoryTitle,
        categoryAvailable: category.categoryAvailable,
        categoryStatus: category.categoryGoal ? category.categoryGoal.goalStatus : 'undefined', // You might define a default status
        categoryGoal: goalDescription
      };
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching categories with goals:', error);
    res.status(400).json({ error: 'Failed to fetch categories' });
  }
};
