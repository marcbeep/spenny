const Category = require('../models/categoryModel');

// Helper function to handle "category not found" scenario
const handleNoCategoryFound = (res) => res.status(404).json({ error: 'Category not found' });

// Add a new category
exports.addCategory = async (req, res) => {
  const { name, budgetedAmount, available, activity } = req.body;
  const userId = req.user._id;

  try {
    const category = await Category.create({
      user: userId,
      name,
      budgetedAmount,
      available,
      activity
    });
    res.status(201).json(category); // Use 201 for successful resource creation
  } catch (err) {
    res.status(400).json({ error: err.message }); // Use 400 for bad requests
  }
};

// List all categories for a user
exports.getCategories = async (req, res) => {
  const userId = req.user._id;

  try {
    const categories = await Category.find({ user: userId });
    res.status(200).json(categories); // Use 200 for successful GET requests
  } catch (err) {
    res.status(400).json({ error: err.message }); // Use 400 for bad requests
  }
};

// Delete a single category
exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return handleNoCategoryFound(res);
    }
    await category.remove();
    res.status(204).end(); // Use 204 for successful requests with no content to return
  } catch (err) {
    res.status(400).json({ error: err.message }); // Use 400 for bad requests
  }
};

// Update a single category
exports.updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const { name, budgetedAmount, available, activity } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(categoryId, {
      name,
      budgetedAmount,
      available,
      activity
    }, { new: true });

    if (!category) {
      return handleNoCategoryFound(res);
    }
    res.status(200).json(category); // Use 200 for successful updates
  } catch (err) {
    res.status(400).json({ error: err.message }); // Use 400 for bad requests
  }
};
