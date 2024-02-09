const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

// Utility function for handling "Category not found" scenarios
const handleNoCategoryFound = (res) => res.status(404).json({ error: 'Category not found' });

/**
 * Creates a new category for the logged-in user.
 */
exports.addCategory = async (req, res) => {
  const { title, assignedAmount } = req.body; 

  try {
    const category = await Category.create({
      user: req.user._id,
      title,
      assignedAmount,
      available: assignedAmount, // Initialize 'available' with the 'assignedAmount' value
      activity: 0 // Initialise 'activity' as 0 for a new category
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
};

/**
 * Retrieves all categories associated with the logged-in user.
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * Retrieves a single category by its ID.
 */
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
    return handleNoCategoryFound(res);
  }
};

/**
 * Deletes a category by its ID.
 */
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const result = await Category.findByIdAndDelete(id);
    if (!result) return handleNoCategoryFound(res);
    res.status(204).send(); 
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete category' });
  }
};

/**
 * Updates the title of a category by its ID.
 * This operation is designed to only affect the category's name,
 * ensuring no impact on budget-related properties.
 */
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body; 

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return handleNoCategoryFound(res);
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, { title }, { new: true });

    if (!updatedCategory) return handleNoCategoryFound(res);
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category' });
  }
};
