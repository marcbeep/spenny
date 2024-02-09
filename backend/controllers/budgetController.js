const Budget = require('../models/budgetModel');
const Category = require('../models/categoryModel');

/**
 * Assigns a specified amount of money to a category, 
 * ensuring it does not exceed the total available funds.
 */
exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const userId = req.user._id;

  try {
    const budget = await Budget.findOne({ user: userId });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return res.status(400).json({ error: 'Invalid amount' });

    // Ensure the assigned amount does not exceed the readyToAssign amount
    if (numericAmount > budget.readyToAssign) {
      return res.status(400).json({ error: 'Assigning amount exceeds available funds' });
    }

    // Update the category and budget accordingly
    category.assignedAmount += numericAmount;
    category.available += numericAmount;
    await category.save();

    budget.totalAssigned += numericAmount;
    budget.readyToAssign -= numericAmount;
    await budget.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully assigned to ${category.title}`,
      category: {
        _id: category._id,
        title: category.title,
        available: category.available
      },
      budget: {
        totalAssigned: budget.totalAssigned,
        readyToAssign: budget.readyToAssign
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
  * Moves a specified amount of money from one category to another, 
  * ensuring sufficient funds in the source category.
**/
exports.moveMoneyBetweenCategories = async (req, res) => {
  const { fromCategoryId, toCategoryId, amount } = req.body;
  const userId = req.user._id;

  try {
    const budget = await Budget.findOne({ user: userId });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    const fromCategory = await Category.findById(fromCategoryId);
    const toCategory = await Category.findById(toCategoryId);

    if (!fromCategory || !toCategory) {
      return res.status(404).json({ error: 'One or both categories not found' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (fromCategory.available < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the source category' });
    }

    // Update the categories' assignedAmount and available funds
    fromCategory.available -= numericAmount;
    toCategory.available += numericAmount;

    await fromCategory.save();
    await toCategory.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully moved from ${fromCategory.title} to ${toCategory.title}`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
  * Removes a specified amount of money from a category, 
  * ensuring sufficient available funds.
**/
exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const userId = req.user._id;

  try {
    const budget = await Budget.findOne({ user: userId });
    const category = await Category.findById(categoryId);

    if (!budget || !category) {
      return res.status(404).json({ error: 'Budget or Category not found' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (category.available < numericAmount) {
      return res.status(400).json({ error: 'Insufficient available funds in the category' });
    }

    // Update the category's available funds
    category.available -= numericAmount;
    await category.save();

    // Optionally adjust budget totals if necessary

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully removed from ${category.title}`,
      category: { _id: category._id, title: category.title, available: category.available }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
* Calculates and returns the total available funds for assignment to categories.
**/ 
exports.getAvailableFunds = async (req, res) => {
  const userId = req.user._id;

  try {
    const budget = await Budget.findOne({ user: userId });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    res.status(200).json({ readyToAssign: budget.readyToAssign });
  } catch (error) {
    res.status(400).json({ error: 'Failed to retrieve available funds' });
  }
};


