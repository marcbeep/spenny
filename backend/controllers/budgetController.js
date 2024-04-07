const Budget = require('../models/budgetModel');
const Category = require('../models/categoryModel');

// Utility function to handle not found errors more efficiently
const handleNotFound = (res, entity = 'Resource') =>
  res.status(404).json({ error: `${entity} not found` });

// Updates the budget based on category actions
async function updateUserBudgetForCategoryActions(userId, amountChange, actionType) {
  try {
    const budget = await Budget.findOne({ user: userId });
    if (!budget) {
      console.error('Budget not found for user:', userId);
      return;
    }
    switch (actionType) {
      case 'assign':
        budget.budgetTotalAssigned += amountChange;
        budget.budgetReadyToAssign -= amountChange;
        break;
      case 'move':
        // No budget adjustment needed for internal category moves
        break;
      case 'remove':
        budget.budgetTotalAssigned -= amountChange;
        budget.budgetReadyToAssign += amountChange;
        break;
    }
    await budget.save();
  } catch (err) {
    console.error(`Error updating user budget for ${actionType} action:`, err);
  }
}

exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const numericAmount = parseFloat(amount);

  try {
    await updateUserBudgetForCategoryActions(req.user._id, numericAmount, 'assign');
    const category = await Category.findById(categoryId);
    if (!category) return handleNotFound(res, 'Category');

    category.categoryAssigned += numericAmount;
    category.categoryAvailable += numericAmount;
    await category.save();

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully assigned to ${category.categoryTitle}`,
      category: {
        _id: category._id,
        title: category.categoryTitle,
        available: category.categoryAvailable,
      },
    });
  } catch (err) {
    res.status(400).json({ error: 'Failed to assign money to category' });
  }
};

exports.moveMoneyBetweenCategories = async (req, res) => {
  const { fromCategoryId, toCategoryId, amount } = req.body;
  const numericAmount = parseFloat(amount);

  try {
    const [fromCategory, toCategory] = await Promise.all([
      Category.findById(fromCategoryId),
      Category.findById(toCategoryId),
    ]);
    if (!fromCategory || !toCategory) return handleNotFound(res, 'One or both categories');

    if (fromCategory.categoryAvailable < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the source category' });
    }

    fromCategory.categoryAvailable -= numericAmount;
    toCategory.categoryAvailable += numericAmount;
    await Promise.all([fromCategory.save(), toCategory.save()]);

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully moved from ${
        fromCategory.categoryTitle
      } to ${toCategory.categoryTitle}`,
    });
  } catch (err) {
    res.status(400).json({ error: 'Failed to move money between categories' });
  }
};

exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const numericAmount = parseFloat(amount);

  try {
    const category = await Category.findById(categoryId);
    if (!category) return handleNotFound(res, 'Category');
    if (category.categoryAvailable < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the category.' });
    }
    category.categoryAvailable -= numericAmount;
    await category.save();
    await updateUserBudgetForCategoryActions(req.user._id, numericAmount, 'remove');

    // Fetch the updated budget for the response
    const updatedBudget = await Budget.findOne({ user: req.user._id });
    res.status(200).json({
        message: `£${numericAmount.toFixed(2)} successfully removed from ${category.categoryTitle}`,
        category: {
            _id: category._id,
            title: category.categoryTitle,
            available: category.categoryAvailable,
        },
        readyToAssign: updatedBudget.budgetReadyToAssign,
    });
  } catch (err) {
    console.error(err); // Log the actual error
    res.status(400).json({ error: 'Failed to remove money from category' });
  }
};


exports.readyToAssign = async (req, res) => {
  try {
    const budget = await Budget.findOne({ user: req.user._id });
    if (!budget) return handleNotFound(res, 'Budget');

    res.status(200).json({ readyToAssign: budget.budgetReadyToAssign });
  } catch (err) {
    res.status(400).json({ error: 'Failed to retrieve Ready to Assign amount' });
  }
};
