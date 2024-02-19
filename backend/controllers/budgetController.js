const Budget = require('../models/budgetModel');
const Category = require('../models/categoryModel');

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
      break;
    case 'remove':
      budget.totalAssigned -= amountChange;
      budget.readyToAssign += amountChange;
      break;
  }
  await budget.save();
}

exports.assignMoneyToCategory = async (req, res) => {
  const { categoryId, amount } = req.body; // CHANGED: No change needed here, kept for context
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
    category: { _id: category._id, title: category.title, available: category.available }
  });
};

exports.moveMoneyBetweenCategories = async (req, res) => {
  const { fromCategoryId, toCategoryId, amount } = req.body; // CHANGED: Harmonized to use fromCategoryId
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
    message: `£${numericAmount.toFixed(2)} successfully moved from ${fromCategory.title} to ${toCategory.title}`
  });
};

exports.removeMoneyFromCategory = async (req, res) => {
  const { categoryId, amount } = req.body; // CHANGED: No change needed here, kept for context
  const userId = req.user._id;
  const numericAmount = parseFloat(amount);

  await updateUserBudgetForCategoryActions(userId, numericAmount, 'remove');
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ error: 'Budget or Category not found' });

  category.available -= numericAmount;
  await category.save();

  res.status(200).json({
    message: `£${numericAmount.toFixed(2)} successfully removed from ${category.title}`,
    category: { _id: category._id, title: category.title, available: category.available }
  });
};

exports.readyToAssign = async (req, res) => {
  const userId = req.user._id;
  const budget = await Budget.findOne({ user: userId });
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  res.status(200).json({ readyToAssign: budget.readyToAssign });
};

exports.moveMoneyToReadyToAssign = async (req, res) => {
  const { fromCategoryId, amount } = req.body; // CHANGED: Harmonized to use fromCategoryId
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
    message: `£${numericAmount.toFixed(2)} successfully moved back to Ready to Assign from ${category.title}.`,
    category: { _id: category._id, title: category.title, available: category.available },
    readyToAssign: budget.readyToAssign,
  });
};
