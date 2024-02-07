const Category = require('../models/categoryModel');

exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    category.available = ((parseFloat(category.available) || 0) + numericAmount).toFixed(2);
    await category.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully assigned to ${category.name}`,
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

exports.moveMoneyBetweenCategories = async (req, res) => {
  const { fromCategoryId, toCategoryId, amount } = req.body;

  try {
    const fromCategory = await Category.findById(fromCategoryId);
    const toCategory = await Category.findById(toCategoryId);

    if (!fromCategory || !toCategory) {
      return res.status(404).json({ error: 'One or both categories not found' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (parseFloat(fromCategory.available) < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the source category' });
    }

    fromCategory.available = (parseFloat(fromCategory.available) - numericAmount).toFixed(2);
    toCategory.available = (parseFloat(toCategory.available) + numericAmount).toFixed(2);

    await fromCategory.save();
    await toCategory.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully moved from ${fromCategory.name} to ${toCategory.name}`,
      details: {
        fromCategory: { id: fromCategory._id, available: fromCategory.available },
        toCategory: { id: toCategory._id, available: toCategory.available }
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (parseFloat(category.available) < numericAmount) {
      return res.status(400).json({ error: 'Insufficient available funds in the category' });
    }

    category.available = (parseFloat(category.available) - numericAmount).toFixed(2);
    await category.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully removed from ${category.name}`,
      category: { id: category._id, available: category.available }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
