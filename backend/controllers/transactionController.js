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
    // Create a new transaction
    const newTransaction = await Transaction.create({
      user: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount: formattedAmount,
      transactionCategory: effectiveTransactionCategory,
      transactionAccount,
    });

    if (effectiveTransactionCategory) {
      // Update the category and account balances if specified
      await updateBalances({
        categoryId: effectiveTransactionCategory,
        accountId: transactionAccount,
        amount: amountChange,
        transactionType: transactionType,
      });

      // After updating the category, check and update the associated goal's status
      await checkAndUpdateGoalStatus(null, effectiveTransactionCategory); // Update goal status for this category
    } else {
      // Adjust "Ready to Assign" for transactions without a category
      await updateUserBudgetForTransaction(req.user._id, amountChange, true);
    }

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

exports.deleteSingleTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transactionToDelete = await Transaction.findById(id);
    if (!transactionToDelete) return handleNoTransactionFound(res);

    // Determine the effect of the transaction deletion on category and account balances
    const amountChange = transactionToDelete.transactionType === 'debit' 
                          ? transactionToDelete.transactionAmount 
                          : -transactionToDelete.transactionAmount;

    if (transactionToDelete.transactionCategory) {
      // Reverse the transaction's effect on the category and account
      await updateBalances({
        categoryId: transactionToDelete.transactionCategory,
        accountId: transactionToDelete.transactionAccount,
        amount: amountChange,
        transactionType: transactionToDelete.transactionType,
        revert: true, // Indicate that this is a reversal operation
      });

      // Update the goal status for the affected category
      await checkAndUpdateGoalStatus(null, transactionToDelete.transactionCategory);
    } else {
      // If there was no category, adjust the budget's "Ready to Assign" balance
      await updateUserBudgetForTransaction(req.user._id, -amountChange, true);
    }

    // Proceed to delete the transaction after handling balance adjustments
    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
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

    // Check for changes in transaction category
    const originalCategory = transactionToUpdate.transactionCategory ? transactionToUpdate.transactionCategory.toString() : null;
    const newCategory = transactionCategory === '' ? null : transactionCategory;

    // Determine if the transaction was originally affecting "Ready to Assign"
    const wasAffectingReadyToAssign = !originalCategory;

    // Calculate the original and new amount changes
    const originalAmountChange = transactionToUpdate.transactionType === 'debit' ? -transactionToUpdate.transactionAmount : transactionToUpdate.transactionAmount;
    const newAmountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

    // If the original transaction did not have a category, reverse its effect on "Ready to Assign"
    if (wasAffectingReadyToAssign) {
      await updateUserBudgetForTransaction(req.user._id, -originalAmountChange, true);
    } else {
      // If it had a category, reverse its category effect
      await updateBalances({
        categoryId: originalCategory,
        accountId: transactionToUpdate.transactionAccount,
        amount: originalAmountChange,
        transactionType: transactionToUpdate.transactionType,
        revert: true,
      });
    }

    // Apply new transaction's effects based on the updated details
    if (newCategory) {
      await updateBalances({
        categoryId: newCategory,
        accountId: transactionAccount,
        amount: newAmountChange,
        transactionType,
      });
    } else {
      // If now no category, directly adjust "Ready to Assign"
      await updateUserBudgetForTransaction(req.user._id, newAmountChange, true);
    }

    // Update the transaction with new details
    transactionToUpdate.transactionTitle = transactionTitle;
    transactionToUpdate.transactionType = transactionType;
    transactionToUpdate.transactionAmount = formattedAmount;
    transactionToUpdate.transactionCategory = newCategory;
    transactionToUpdate.transactionAccount = transactionAccount;
    await transactionToUpdate.save();

    // Update goals if categories are involved
    if (originalCategory) {
      await checkAndUpdateGoalStatus(null, originalCategory); // Update for original category
    }
    if (newCategory && newCategory !== originalCategory) {
      await checkAndUpdateGoalStatus(null, newCategory); // Update for new category if different
    }

    res.status(200).json(transactionToUpdate);
  } catch (err) {
    console.error(err); // Detailed error logging
    res.status(400).json({ error: 'Failed to update transaction' });
  }
};
