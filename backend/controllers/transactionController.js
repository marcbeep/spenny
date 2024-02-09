const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');
const mongoose = require('mongoose');

// Utility function to handle "Transaction not found" responses
const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

/**
 * Retrieves all transactions for the logged-in user, sorted by creation date.
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch transactions' });
  }
};

/**
 * Retrieves a single transaction by its ID.
 */
exports.getSingleTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return handleNoTransactionFound(res);
    res.status(200).json(transaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

/**
 * Creates a new transaction, updates the associated category's activity and available funds,
 * and adjusts the account balance.
 */
exports.createTransaction = async (req, res) => {
  const { title, amount, category: categoryId, account: accountId } = req.body;

  // Verify both the category and account exist
  const categoryExists = await Category.exists({ _id: categoryId });
  const accountExists = await Account.exists({ _id: accountId });

  if (!categoryExists || !accountExists) {
    return res.status(404).json({ error: 'Category or Account not found' });
  }

  try {
    const newTransaction = await Transaction.create({
      title,
      amount,
      category: categoryId,
      account: accountId,
      user: req.user._id,
    });

    // Update category's activity and available funds
    await Category.findByIdAndUpdate(categoryId, { $inc: { activity: amount, available: -amount } });
    
    // Update the account balance
    const account = await Account.findById(accountId);
    account.balance -= amount;
    await account.save();

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

/**
 * Deletes a transaction, reverses its effects on the associated category's activity and available funds,
 * and adjusts the account balance.
 */
exports.deleteSingleTransaction = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transaction = await Transaction.findByIdAndRemove(id);
    if (!transaction) return handleNoTransactionFound(res);

    // Reverse the transaction's effects on the category
    await Category.findByIdAndUpdate(transaction.category, { $inc: { activity: -transaction.amount, available: transaction.amount } });
    
    // Reverse the transaction's effects on the account balance here
    const account = await Account.findById(transaction.account);
    account.balance += transaction.amount;
    await account.save();

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

/**
 * Updates a transaction, adjusts the associated categories' and account's activity and available funds accordingly.
 */
exports.updateSingleTransaction = async (req, res) => {
  const { id } = req.params;
  const { title, amount, category: newCategoryId, account: newAccountId } = req.body;

  // Verify the new category and account exist before proceeding
  const categoryExists = await Category.exists({ _id: newCategoryId });
  const accountExists = await Account.exists({ _id: newAccountId });

  if (!mongoose.Types.ObjectId.isValid(id) || !categoryExists || !accountExists) {
    return handleNoTransactionFound(res);
  }

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return handleNoTransactionFound(res);

    // Adjust categories and accounts
    if (transaction.category.toString() !== newCategoryId || transaction.amount !== amount) {
      // Reverse old category's changes
      await Category.findByIdAndUpdate(transaction.category, { $inc: { activity: -transaction.amount, available: transaction.amount } });
      // Apply changes to the new category
      await Category.findByIdAndUpdate(newCategoryId, { $inc: { activity: amount, available: -amount } });
    }

    // Adjust the old and new account balances 
    if (transaction.account.toString() !== newAccountId || transaction.amount !== amount) {
      const oldAccount = await Account.findById(transaction.account);
      oldAccount.balance += transaction.amount;
      await oldAccount.save();

      const newAccount = await Account.findById(newAccountId);
      newAccount.balance -= amount;
      await newAccount.save();
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(id, {
      title,
      amount,
      category: newCategoryId,
      account: newAccountId,
    }, { new: true });

    res.status(200).json(updatedTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};