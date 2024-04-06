const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');
const mongoose = require('mongoose');

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
      type,
      amount,
      category: categoryId,
      account: accountId,
      user: req.user._id,
    });

    // Update category's activity and adjust available funds accordingly
    await Category.findByIdAndUpdate(categoryId, {
      $inc: { activity: amount, available: -amount },
    });

    // Update the account balance
    const account = await Account.findById(accountId);
    account.balance -= amount; // Assuming all transactions are expenses for simplicity
    await account.save();

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

    try {
      await Category.findByIdAndUpdate(transaction.category, {
        $inc: { activity: -transaction.amount, available: transaction.amount },
      });
    } catch (err) {
      console.error('Failed to update category:', err);
    }

    try {
      const account = await Account.findById(transaction.account);
      account.balance += transaction.amount;
      await account.save();
    } catch (err) {
      console.error('Failed to update account:', err);
    }

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    console.error('Failed to delete transaction:', err);
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

    // Calculate differences for adjusting categories and accounts
    const amountDifference = amount - transaction.amount;
    const isCategoryChanged = transaction.category.toString() !== newCategoryId;
    const isAccountChanged = transaction.account.toString() !== newAccountId;

    if (isCategoryChanged) {
      // Reverse old category's changes
      await Category.findByIdAndUpdate(transaction.category, {
        $inc: { activity: -transaction.amount, available: transaction.amount },
      });
      // Apply changes to the new category
      await Category.findByIdAndUpdate(newCategoryId, {
        $inc: { activity: amount, available: -amount },
      });
    } else if (amountDifference !== 0) {
      // Adjust the same category if only the amount has changed
      await Category.findByIdAndUpdate(transaction.category, {
        $inc: { activity: amountDifference, available: -amountDifference },
      });
    }

    if (isAccountChanged) {
      // Adjust old and new account balances
      const oldAccount = await Account.findById(transaction.account);
      oldAccount.balance += transaction.amount; // Revert original transaction from old account
      await oldAccount.save();

      const newAccount = await Account.findById(newAccountId);
      newAccount.balance -= amount; // Apply new transaction to new account
      await newAccount.save();
    } else if (amountDifference !== 0) {
      // Adjust the same account if only the amount has changed
      const account = await Account.findById(transaction.account);
      account.balance -= amountDifference;
      await account.save();
    }

    // Update the transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        title,
        amount,
        category: newCategoryId,
        account: newAccountId,
      },
      { new: true },
    );

    res.status(200).json(updatedTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};
