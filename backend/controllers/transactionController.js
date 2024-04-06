const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');
const mongoose = require('mongoose');

// Utility function to update category and account balances
const updateBalances = async ({ categoryId, accountId, amount, type, revert = false }) => {
  const multiplier = revert ? -1 : 1;
  const amountChange = type === 'debit' ? -amount : amount;

  // Update Category
  await Category.findByIdAndUpdate(categoryId, {
    $inc: { activity: amount * multiplier, available: amountChange * multiplier },
  });

  // Update Account
  const account = await Account.findById(accountId);
  account.balance += amountChange * multiplier;
  await account.save();
};

/**
 * Retrieves all transactions for the logged-in user, sorted by creation date.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
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
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
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
 * Creates a new transaction.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.createTransaction = async (req, res) => {
  const { title, type, amount, category: categoryId, account: accountId } = req.body;

  // Verify both the category and account exist
  const categoryExists = await Category.exists({ _id: categoryId });
  const accountExists = await Account.exists({ _id: accountId });

  if (!categoryExists || !accountExists) {
    return res.status(404).json({ error: 'Category or Account not found' });
  }

  try {
    const newTransaction = await Transaction.create({
      title,
      type,
      amount,
      category: categoryId,
      account: accountId,
      user: req.user._id,
    });

    // Update category and account balances
    await updateBalances({ categoryId, accountId, amount, type });

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

/**
 * Deletes a single transaction by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteSingleTransaction = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) return handleNoTransactionFound(res);

    // Reverse the transaction's effects on the category and account
    await updateBalances({
      categoryId: transaction.category,
      accountId: transaction.account,
      amount: transaction.amount,
      type: transaction.type,
      revert: true,
    });

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

/**
 * Updates a single transaction by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.updateSingleTransaction = async (req, res) => {
  const { id } = req.params;
  const { title, type, amount, category: newCategoryId, account: newAccountId } = req.body;

  // Verify the new category and account exist
  const categoryExists = await Category.exists({ _id: newCategoryId });
  const accountExists = await Account.exists({ _id: newAccountId });

  if (!mongoose.Types.ObjectId.isValid(id) || !categoryExists || !accountExists) {
    return handleNoTransactionFound(res);
  }

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return handleNoTransactionFound(res);

    // Reverse original transaction's effects
    await updateBalances({
      categoryId: transaction.category,
      accountId: transaction.account,
      amount: transaction.amount,
      type: transaction.type,
      revert: true,
    });

    // Apply new transaction's effects
    await updateBalances({ categoryId: newCategoryId, accountId: newAccountId, amount, type });

    // Update the transaction
    transaction.title = title;
    transaction.type = type;
    transaction.amount = amount;
    transaction.category = newCategoryId;
    transaction.account = newAccountId;
    await transaction.save();

    res.status(200).json(transaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};
