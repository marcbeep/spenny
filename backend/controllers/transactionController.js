const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

exports.getAllTransactions = async (req, res) => {
  try {
    const allTransactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(allTransactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return handleNoTransactionFound(res);
  }

  try {
    const singleTransaction = await Transaction.findById(req.params.id);
    if (!singleTransaction) return handleNoTransactionFound(res);
    res.status(200).json(singleTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

exports.createTransaction = async (req, res) => {
  const { title, amount, category: categoryId } = req.body;

  if (!await Category.exists({ _id: categoryId })) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const newTransaction = await Transaction.create({
      title,
      amount,
      category: categoryId,
      user: req.user._id,
    });

    await Category.findByIdAndUpdate(categoryId, {
      $inc: { activity: amount, available: -amount }
    });

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return handleNoTransactionFound(res);
  }

  try {
    const transactionToDelete = await Transaction.findByIdAndRemove(req.params.id);
    if (!transactionToDelete) return handleNoTransactionFound(res);

    await Category.findByIdAndUpdate(transactionToDelete.category, {
      $inc: { activity: -transactionToDelete.amount, available: transactionToDelete.amount }
    });

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

exports.updateSingleTransaction = async (req, res) => {
  const { title, amount, category: newCategoryId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return handleNoTransactionFound(res);
  }

  try {
    const transactionToUpdate = await Transaction.findById(req.params.id);
    if (!transactionToUpdate) return handleNoTransactionFound(res);

    if (transactionToUpdate.category.toString() !== newCategoryId || transactionToUpdate.amount !== amount) {
      await Category.findByIdAndUpdate(transactionToUpdate.category, {
        $inc: { activity: -transactionToUpdate.amount, available: transactionToUpdate.amount }
      });

      await Category.findByIdAndUpdate(newCategoryId, {
        $inc: { activity: amount, available: -amount }
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, {
      title,
      amount,
      category: newCategoryId,
    }, { new: true });

    res.status(200).json(updatedTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};
