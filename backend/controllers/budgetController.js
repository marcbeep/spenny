const Budget = require('../models/budgetModel');
const Category = require('../models/categoryModel');

// Utility function for updating the budget
async function updateUserBudgetForCategoryActions(userId, amountChange, actionType) {
  const budget = await Budget.findOne({ user: userId });
  if (!budget) {
    console.error("Budget not found for user:", userId);
    return;
  }
  switch (actionType) {
    case 'assign':
      budget.totalAssigned += amountChange;
      budget.readyToAssign -= amountChange;
      break;
    case 'move':
      // No change to readyToAssign when moving between categories
      break;
    case 'remove':
      budget.totalAssigned -= amountChange;
      budget.readyToAssign += amountChange;
      break;
    default:
      console.error("Unknown action type for budget update:", actionType);
  }
  await budget.save();
}

/**
 * Assigns a specified amount of money to a category, ensuring it does not exceed the total available funds.
 */
exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  try {
    if (isNaN(numericAmount)) return res.status(400).json({ error: 'Invalid amount' });

    await updateUserBudgetForCategoryActions(userId, numericAmount, 'assign');

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    category.assignedAmount += numericAmount;
    category.available += numericAmount;
    await category.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully assigned to ${category.title}`,
      category: {
        _id: category._id,
        title: category.title,
        available: category.available
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
  * Moves a specified amount of money from one category to another, ensuring sufficient funds in the source category.
**/
exports.moveMoneyBetweenCategories = async (req, res) => {
  const { fromCategoryId, toCategoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  try {
    if (isNaN(numericAmount)) return res.status(400).json({ error: 'Invalid amount' });

    const fromCategory = await Category.findById(fromCategoryId);
    const toCategory = await Category.findById(toCategoryId);
    if (!fromCategory || !toCategory) {
      return res.status(404).json({ error: 'One or both categories not found' });
    }

    if (fromCategory.available < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the source category' });
    }

    fromCategory.available -= numericAmount;
    toCategory.available += numericAmount;
    await fromCategory.save();
    await toCategory.save();

    // Note: No need to call updateUserBudgetForCategoryActions for 'move' as it doesn't affect readyToAssign

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully moved from ${fromCategory.title} to ${toCategory.title}`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
  * Removes a specified amount of money from a category, ensuring sufficient available funds.
**/
exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  try {
    if (isNaN(numericAmount)) return res.status(400).json({ error: 'Invalid amount' });

    await updateUserBudgetForCategoryActions(userId, numericAmount, 'remove');

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Budget or Category not found' });

    category.available -= numericAmount;
    await category.save();

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
exports.readyToAssign = async (req, res) => {
  const userId = req.user._id;
  try {
    const budget = await Budget.findOne({ user: userId });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.status(200).json({ readyToAssign: budget.readyToAssign });
  } catch (error) {
    res.status(400).json({ error: 'Failed to retrieve available funds' });
  }
};

/**
 * Moves specified amount of money from a category back to Ready to Assign.
 */
exports.moveMoneyToReadyToAssign = async (req, res) => {
  const { categoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  try {
    // Validate amount
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount specified.' });
    }

    // Find the category and budget for the user
    const category = await Category.findById(categoryId);
    const budget = await Budget.findOne({ user: userId });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    // Ensure there are sufficient funds in the category
    if (category.available < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the category.' });
    }

    // Update category and budget
    category.available -= numericAmount;
    budget.readyToAssign += numericAmount;

    await category.save();
    await budget.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully moved back to Ready to Assign from ${category.title}.`,
      category: { _id: category._id, title: category.title, available: category.available },
      readyToAssign: budget.readyToAssign,
    });
  } catch (err) {
    console.error("Error moving funds to Ready to Assign:", err);
    res.status(500).json({ error: 'An error occurred while moving funds.' });
  }
};

