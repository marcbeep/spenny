const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');

const handleNoTransactionFound = (res) => {
  return res.status(404).json({ error: 'No transaction found' });
};

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const allTransactions = await Transaction.find({ user_id }).sort({ createdAt: -1 });
    return res.status(200).json(allTransactions);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Get a single transaction
const getSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return handleNoTransactionFound(res);

  try {
    const singleTransaction = await Transaction.findById(req.params.id);
    if (!singleTransaction) return handleNoTransactionFound(res);
    return res.status(200).json(singleTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  const { title, amount, category } = req.body;

  try {
    const user_id = req.user.id;
    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      user_id,
    });
    return res.status(200).json(newTransaction);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Delete a single transaction
const deleteSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return handleNoTransactionFound(res);

  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) return handleNoTransactionFound(res);
    return res.status(200).json(deletedTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

// Update a single transaction
const updateSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return handleNoTransactionFound(res);

  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, {
      ...req.body,
    }, { new: true });
    if (!updatedTransaction) return handleNoTransactionFound(res);
    return res.status(200).json(updatedTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
};
