const Budget = require('../models/budgetModel');
const Category = require('../models/categoryModel');

/**
 * Updates the user's budget based on category actions like assigning or removing money.
 * @param {string} userId - The user's database ID.
 * @param {number} amountChange - The amount of change to be applied to the budget.
 * @param {string} actionType - The type of action to be performed ('assign', 'move', or 'remove').
 */
async function updateUserBudgetForCategoryActions(userId, amountChange, actionType) {
  const budget = await Budget.findOne({ user: userId });
  if (!budget) {
    console.error('Budget not found for user:', userId);
    return;
  }
  switch (actionType) {
    case 'assign':
      budget.totalAssigned += amountChange;
      budget.readyToAssign -= amountChange;
      break;
    case 'move':
      break;
    case 'remove':
      budget.totalAssigned -= amountChange;
      budget.readyToAssign += amountChange;
      break;
  }
  await budget.save();
}

/**
 * Assigns money to a category.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  await updateUserBudgetForCategoryActions(userId, numericAmount, 'assign');
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  category.assignedAmount += numericAmount;
  category.available += numericAmount;
  await category.save();

  res.status(200).json({
    message: `£${numericAmount.toFixed(2)} successfully assigned to ${category.title}`,
    category: { _id: category._id, title: category.title, available: category.available },
  });
};

/**
 * Moves money between categories.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.moveMoneyBetweenCategories = async (req, res) => {
  const { fromCategoryId, toCategoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

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

  res.status(200).json({
    message: `£${numericAmount.toFixed(2)} successfully moved from ${fromCategory.title} to ${
      toCategory.title
    }`,
  });
};

/**
 * Removes money from a category.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  await updateUserBudgetForCategoryActions(userId, numericAmount, 'remove');
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ error: 'Budget or Category not found' });

  category.available -= numericAmount;
  await category.save();

  res.status(200).json({
    message: `£${numericAmount.toFixed(2)} successfully removed from ${category.title}`,
    category: { _id: category._id, title: category.title, available: category.available },
  });
};

/**
 * Retrieves the amount of money ready to be assigned.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.readyToAssign = async (req, res) => {
  const userId = req.user._id;
  const budget = await Budget.findOne({ user: userId });
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  res.status(200).json({ readyToAssign: budget.readyToAssign });
};

/**
 * Moves money back to "Ready to Assign" from a category.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.moveMoneyToReadyToAssign = async (req, res) => {
  const { fromCategoryId, amount } = req.body;
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  const category = await Category.findById(fromCategoryId);
  if (!category) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  const budget = await Budget.findOne({ user: userId });
  if (!budget) {
    return res.status(404).json({ error: 'Budget not found.' });
  }

  if (category.available < numericAmount) {
    return res.status(400).json({ error: 'Insufficient funds in the category.' });
  }

  category.available -= numericAmount;
  budget.readyToAssign += numericAmount;
  await category.save();
  await budget.save();

  res.status(200).json({
    message: `£${numericAmount.toFixed(2)} successfully moved back to Ready to Assign from ${
      category.title
    }.`,
    category: { _id: category._id, title: category.title, available: category.available },
    readyToAssign: budget.readyToAssign,
  });
};
