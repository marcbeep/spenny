const Category = require('../models/categoryModel');

// Move money between categories
exports.moveMoneyBetweenCategories = async (req, res) => {
  const { fromCategoryId, toCategoryId, amount } = req.body;

  try {
    const fromCategory = await Category.findById(fromCategoryId);
    const toCategory = await Category.findById(toCategoryId);

    if (!fromCategory || !toCategory) {
      return res.status(404).json({ error: 'One or both categories not found' });
    }

    if (fromCategory.available < amount) {
      return res.status(400).json({ error: 'Insufficient funds in the source category' });
    }

    // Update the categories
    fromCategory.available -= amount;
    toCategory.available += amount;

    await fromCategory.save();
    await toCategory.save();

    res.status(200).json({
      message: `£${amount} successfully moved from ${fromCategory.name} to ${toCategory.name}`,
      fromCategory: {
        id: fromCategory._id,
        name: fromCategory.name,
        available: fromCategory.available
      },
      toCategory: {
        id: toCategory._id,
        name: toCategory.name,
        available: toCategory.available
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Assign money to a category
exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.available += amount; // Assuming this increases the 'available' funds without affecting the 'activity'

    await category.save();

    res.status(200).json({
      message: `£${amount} successfully assigned to ${category.name}`,
      category: {
        id: category._id,
        name: category.name,
        available: category.available
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove money from a category (e.g., unassigning money)
exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.available < amount) {
      return res.status(400).json({ error: 'Insufficient available funds in the category' });
    }

    category.available -= amount;

    await category.save();

    res.status(200).json({
      message: `£${amount} successfully removed from ${category.name}`,
      category: {
        id: category._id,
        name: category.name,
        available: category.available
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
