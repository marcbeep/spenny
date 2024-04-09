const Budget = require('../models/budgetModel');
const Category = require('../models/categoryModel');
const { checkOwnership } = require('../utils/utils');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');

const handleNotFound = (res, entity = 'Resource') =>
  res.status(404).json({ error: `${entity} not found` });

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
  } catch (error) {
    console.error(`Error updating user budget for ${actionType} action:`, error);
    throw error;
  }
}

exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const numericAmount = parseFloat(amount);

  try {
    await updateUserBudgetForCategoryActions(req.user._id, numericAmount, 'assign');
    const category = await Category.findById(categoryId);
    if (!category) {
      console.error('Category not found');
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!checkOwnership(category, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this category' });
    }

    category.categoryAssigned += numericAmount;
    category.categoryAvailable += numericAmount;
    await category.save();

    // After updating the category, check and update the associated goal's status
    await checkAndUpdateGoalStatus(null, categoryId);

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully assigned to ${category.categoryTitle}`,
      category: {
        _id: category._id,
        title: category.categoryTitle,
        available: category.categoryAvailable,
      },
    });
  } catch (error) {
    console.error('Error assigning money to category:', error);
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
    if (!fromCategory || !toCategory) {
      console.error('One or both categories not found');
      return res.status(404).json({ error: 'One or both categories not found' });
    }

    if (!checkOwnership(fromCategory, req.user._id) || !checkOwnership(toCategory, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify one or both categories' });
    }

    if (fromCategory.categoryAvailable < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the source category' });
    }

    fromCategory.categoryAvailable -= numericAmount;
    toCategory.categoryAvailable += numericAmount;
    await Promise.all([fromCategory.save(), toCategory.save()]);

    await Promise.all([
      checkAndUpdateGoalStatus(null, fromCategoryId),
      checkAndUpdateGoalStatus(null, toCategoryId),
    ]);

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully moved from ${
        fromCategory.categoryTitle
      } to ${toCategory.categoryTitle}`,
    });
  } catch (error) {
    console.error('Error moving money between categories:', error);
    res.status(400).json({ error: 'Failed to move money between categories' });
  }
};

exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const numericAmount = parseFloat(amount);

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      console.error('Category not found');
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!checkOwnership(category, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this category' });
    }

    if (category.categoryAvailable < numericAmount) {
      return res.status(400).json({ error: 'Insufficient funds in the category.' });
    }
    category.categoryAvailable -= numericAmount;
    await category.save();
    await updateUserBudgetForCategoryActions(req.user._id, numericAmount, 'remove');

    await checkAndUpdateGoalStatus(null, categoryId);

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
  } catch (error) {
    console.error('Error removing money from category:', error);
    res.status(400).json({ error: 'Failed to remove money from category' });
  }
};

exports.readyToAssign = async (req, res) => {
  try {
    const budget = await Budget.findOne({ user: req.user._id });
    if (!budget) {
      console.error('Budget not found');
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.status(200).json({ readyToAssign: budget.budgetReadyToAssign });
  } catch (error) {
    console.error('Error retrieving Ready to Assign amount:', error);
    res.status(400).json({ error: 'Failed to retrieve Ready to Assign amount' });
  }
};

exports.moveToReadyToAssign = async (req, res) => {
  const { categoryId, amount } = req.body;
  const numericAmount = parseFloat(amount);

  if (numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero.' });
  }

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return handleNotFound(res, 'Category');
    }

    if (!checkOwnership(category, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this category' });
    }

    if (category.categoryAssigned < numericAmount) {
      return res.status(400).json({ error: 'Insufficient assigned funds in the category.' });
    }

    // Decrease category's assigned funds
    category.categoryAssigned -= numericAmount;
    // Optionally, adjust categoryAvailable if necessary
    // category.categoryAvailable -= numericAmount;

    await category.save();

    // Increase the budget's Ready to Assign
    await updateUserBudgetForCategoryActions(req.user._id, numericAmount, 'remove');

    res.status(200).json({
      message: `£${numericAmount.toFixed(2)} successfully moved back to Ready to Assign from ${
        category.categoryTitle
      }`,
      category: {
        _id: category._id,
        title: category.categoryTitle,
        assigned: category.categoryAssigned,
        // available: category.categoryAvailable,
      },
    });
  } catch (error) {
    console.error('Error moving money to Ready to Assign:', error);
    res.status(500).json({ error: 'Failed to move money to Ready to Assign' });
  }
};
