const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

// Helper function to handle "transaction not found" scenario
const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

// Consistently use req.params.id for accessing the transaction ID from the URL parameter
// Get all transactions for the logged-in user
exports.getAllTransactions = async (req, res) => {
  try {
    const userId = req.user._id; // Use camelCase for variable names
    const allTransactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(allTransactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single transaction by ID
exports.getSingleTransaction = async (req, res) => {
  const transactionId = req.params.id; // Use a consistent variable for clarity
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return handleNoTransactionFound(res);
  }

  try {
    const singleTransaction = await Transaction.findById(transactionId);
    if (!singleTransaction) return handleNoTransactionFound(res);
    res.status(200).json(singleTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const { title, amount, category: categoryId } = req.body;
  const userId = req.user._id; // Use camelCase for consistency

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newTransaction = await Transaction.create({
      title,
      amount,
      category: categoryId,
      user: userId,
    });

    // Update category balances
    category.activity += amount;
    category.available -= amount;
    await category.save();

    res.status(201).json(newTransaction); // Correctly use 201 for resource creation
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a single transaction
exports.deleteSingleTransaction = async (req, res) => {
  const transactionId = req.params.id; // Standardize variable naming
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return handleNoTransactionFound(res);
  }

  try {
    const transactionToDelete = await Transaction.findById(transactionId);
    if (!transactionToDelete) return handleNoTransactionFound(res);

    // Update category balances before deletion
    const category = await Category.findById(transactionToDelete.category);
    if (category) {
      category.activity -= transactionToDelete.amount;
      category.available += transactionToDelete.amount;
      await category.save();
    }

    await transactionToDelete.remove();
    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};

// Update a single transaction
exports.updateSingleTransaction = async (req, res) => {
  const transactionId = req.params.id; // Ensure consistency in variable naming
  const { title, amount, category: newCategoryId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return handleNoTransactionFound(res);
  }

  try {
    const transactionToUpdate = await Transaction.findById(transactionId);
    if (!transactionToUpdate) return handleNoTransactionFound(res);

    // Adjust the old category if changing categories or amounts
    if (transactionToUpdate.category.toString() !== newCategoryId || transactionToUpdate.amount !== amount) {
      const oldCategory = await Category.findById(transactionToUpdate.category);
      if (oldCategory) {
        oldCategory.activity -= transactionToUpdate.amount;
        oldCategory.available += transactionToUpdate.amount;
        await oldCategory.save();
      }

      // Update the new category
      const newCategory = await Category.findById(newCategoryId);
      if (newCategory) {
        newCategory.activity += amount;
        newCategory.available -= amount;
        await newCategory.save();
      }
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, {
      title,
      amount,
      category: newCategoryId,
    }, { new: true });

    res.status(200).json(updatedTransaction);
  } catch (err) {
    return handleNoTransactionFound(res);
  }
};