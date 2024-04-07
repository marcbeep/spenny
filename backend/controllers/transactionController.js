const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');

// Shared error handler
const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

// Utility function to format and round amounts to "0.00"
const formatAmount = (amount) => {
  return Number(parseFloat(amount).toFixed(2));
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
  const formattedAmount = formatAmount(transactionAmount);

  try {
    const newTransaction = await Transaction.create({
      user: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount: formattedAmount,
      transactionCategory,
      transactionAccount,
    });

    await updateBalances({
      categoryId: transactionCategory,
      accountId: transactionAccount,
      amount: formattedAmount,
      transactionType,
    });

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

exports.deleteSingleTransaction = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transactionToDelete = await Transaction.findByIdAndDelete(id);
    if (!transactionToDelete) return handleNoTransactionFound(res);

    await updateBalances({
      categoryId: transactionToDelete.transactionCategory,
      accountId: transactionToDelete.transactionAccount,
      amount: transactionToDelete.transactionAmount,
      transactionType: transactionToDelete.transactionType,
      revert: true,
    });

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

    // Reverse original transaction's effects using the original amount stored in the transaction
    await updateBalances({
      categoryId: transactionToUpdate.transactionCategory,
      accountId: transactionToUpdate.transactionAccount,
      amount: transactionToUpdate.transactionAmount,
      transactionType: transactionToUpdate.transactionType,
      revert: true,
    });

    // Apply new transaction's effects using the formatted amount
    await updateBalances({
      categoryId: transactionCategory,
      accountId: transactionAccount,
      amount: formattedAmount,
      transactionType,
    });

    // Update the transaction with the new details, including the formatted amount
    transactionToUpdate.transactionTitle = transactionTitle;
    transactionToUpdate.transactionType = transactionType;
    transactionToUpdate.transactionAmount = formattedAmount;
    transactionToUpdate.transactionCategory = transactionCategory;
    transactionToUpdate.transactionAccount = transactionAccount;
    await transactionToUpdate.save();

    res.status(200).json(transactionToUpdate);
  } catch (err) {
    handleNoTransactionFound(res);
  }
};
