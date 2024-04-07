const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');

// Shared error handler
const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

// Utility function to format and round amounts to "0.00"
const formatAmount = (amount) => {
  return Number(parseFloat(amount).toFixed(2));
};

// Adjust budget and category balances based on transaction
const updateUserBudgetForTransaction = async (userId, amount, addToReadyToAssign) => {
  const budget = await Budget.findOne({ user: userId });
  if (!budget) return;

  if (addToReadyToAssign) {
    // For transactions directly affecting "Ready to Assign"
    budget.budgetReadyToAssign += amount;
  } else {
    // For transactions within categories, adjust total assigned but not "Ready to Assign"
    budget.budgetTotalAssigned += amount;
  }
  await budget.save();
};

const updateBalances = async ({
  categoryId,
  accountId,
  amount,
  transactionType,
  revert = false,
}) => {
  const multiplier = revert ? -1 : 1;
  const formattedAmount = formatAmount(amount); // Format and round amount
  const amountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

  // Update Category
  await Category.findByIdAndUpdate(categoryId, {
    $inc: {
      categoryActivity: formattedAmount * multiplier,
      categoryAvailable: amountChange * multiplier,
    },
  });

  // Update Account
  const account = await Account.findById(accountId);
  if (account) {
    account.accountBalance = formatAmount(account.accountBalance + amountChange * multiplier);
    await account.save();
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch transactions' });
  }
};

exports.getSingleTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return handleNoTransactionFound(res);
    res.status(200).json(transaction);
  } catch (err) {
    handleNoTransactionFound(res);
  }
};

exports.createTransaction = async (req, res) => {
  const {
    transactionTitle,
    transactionType,
    transactionAmount,
    transactionCategory,
    transactionAccount,
  } = req.body;
  // Convert empty string to null for transactionCategory
  const effectiveTransactionCategory = transactionCategory === '' ? null : transactionCategory;

  const formattedAmount = formatAmount(transactionAmount);
  const amountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

  try {
    const newTransaction = await Transaction.create({
      user: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount: formattedAmount,
      transactionCategory: effectiveTransactionCategory,
      transactionAccount,
    });

    if (effectiveTransactionCategory) {
      // Update the category if specified
      await updateCategoryBalance(effectiveTransactionCategory, amountChange);
    }
    // Adjust "Ready to Assign" for transactions without a category
    await updateUserBudgetForTransaction(req.user._id, amountChange, !transactionCategory);

    // Updates goals
    await checkAndUpdateGoalStatus();

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

exports.deleteSingleTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transactionToDelete = await Transaction.findByIdAndDelete(id);
    if (!transactionToDelete) return handleNoTransactionFound(res);

    const amountChange =
      transactionToDelete.transactionType === 'debit'
        ? transactionToDelete.transactionAmount
        : -transactionToDelete.transactionAmount;
    if (transactionToDelete.transactionCategory) {
      await updateCategoryBalance(transactionToDelete.transactionCategory, amountChange);
    } else {
      await updateUserBudgetForTransaction(
        req.user._id,
        amountChange,
        !transactionToDelete.transactionCategory,
      );
    }

    // Update goals
    await checkAndUpdateGoalStatus();

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    handleNoTransactionFound(res);
  }
};

exports.updateSingleTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    transactionTitle,
    transactionType,
    transactionAmount,
    transactionCategory,
    transactionAccount,
  } = req.body;
  const formattedAmount = formatAmount(transactionAmount);

  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transactionToUpdate = await Transaction.findById(id);
    if (!transactionToUpdate) return handleNoTransactionFound(res);

    // Determine if the transaction was originally affecting "Ready to Assign"
    const wasAffectingReadyToAssign = !transactionToUpdate.transactionCategory;

    // Calculate the original and new amount changes
    const originalAmountChange =
      transactionToUpdate.transactionType === 'debit'
        ? -transactionToUpdate.transactionAmount
        : transactionToUpdate.transactionAmount;
    const newAmountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

    // If the original transaction did not have a category, reverse its effect on "Ready to Assign"
    if (wasAffectingReadyToAssign) {
      await updateUserBudgetForTransaction(req.user._id, -originalAmountChange, true);
    } else if (transactionToUpdate.transactionCategory) {
      // If it had a category, reverse its category effect
      await updateBalances({
        categoryId: transactionToUpdate.transactionCategory,
        accountId: transactionToUpdate.transactionAccount,
        amount: originalAmountChange,
        transactionType: transactionToUpdate.transactionType,
        revert: true,
      });
    }

    // Apply new transaction's effects based on the updated category
    const effectiveTransactionCategory = transactionCategory === '' ? null : transactionCategory;
    if (effectiveTransactionCategory) {
      // Update balances if it now has a category
      await updateBalances({
        categoryId: effectiveTransactionCategory,
        accountId: transactionAccount,
        amount: newAmountChange,
        transactionType,
      });
    } else {
      // If still no category, directly adjust "Ready to Assign"
      await updateUserBudgetForTransaction(req.user._id, newAmountChange, true);
    }

    // Update the transaction with new details, consistently using null for no category
    transactionToUpdate.transactionTitle = transactionTitle;
    transactionToUpdate.transactionType = transactionType;
    transactionToUpdate.transactionAmount = formattedAmount;
    transactionToUpdate.transactionCategory = effectiveTransactionCategory;
    transactionToUpdate.transactionAccount = transactionAccount;
    await transactionToUpdate.save();

    // Update goals
    await checkAndUpdateGoalStatus();

    res.status(200).json(transactionToUpdate);
  } catch (err) {
    console.error(err); // Detailed error logging
    res.status(400).json({ error: 'Failed to update transaction' });
  }
};
