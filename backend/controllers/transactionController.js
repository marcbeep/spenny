const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');

// Shared error handler
const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

// Utility function to update category and account balances
const updateBalances = async ({
  categoryId,
  accountId,
  amount,
  transactionType,
  revert = false,
}) => {
  const multiplier = revert ? -1 : 1;
  const amountChange = transactionType === 'debit' ? -amount : amount;

  // Update Category
  await Category.findByIdAndUpdate(categoryId, {
    $inc: { categoryActivity: amount * multiplier, categoryAvailable: amountChange * multiplier },
  });

  // Update Account
  const account = await Account.findById(accountId);
  if (account) {
    account.accountBalance += amountChange * multiplier;
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

  try {
    const newTransaction = await Transaction.create({
      user: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount,
      transactionCategory,
      transactionAccount,
    });

    await updateBalances({
      categoryId: transactionCategory,
      accountId: transactionAccount,
      amount: transactionAmount,
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

  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transactionToUpdate = await Transaction.findById(id);
    if (!transactionToUpdate) return handleNoTransactionFound(res);

    // Reverse original transaction's effects
    await updateBalances({
      categoryId: transactionToUpdate.transactionCategory,
      accountId: transactionToUpdate.transactionAccount,
      amount: transactionToUpdate.transactionAmount,
      transactionType: transactionToUpdate.transactionType,
      revert: true,
    });

    // Apply new transaction's effects
    await updateBalances({
      categoryId: transactionCategory,
      accountId: transactionAccount,
      amount: transactionAmount,
      transactionType,
    });

    transactionToUpdate.transactionTitle = transactionTitle;
    transactionToUpdate.transactionType = transactionType;
    transactionToUpdate.transactionAmount = transactionAmount;
    transactionToUpdate.transactionCategory = transactionCategory;
    transactionToUpdate.transactionAccount = transactionAccount;
    await transactionToUpdate.save();

    res.status(200).json(transactionToUpdate);
  } catch (err) {
    handleNoTransactionFound(res);
  }
};
