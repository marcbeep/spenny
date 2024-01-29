const Transaction = require('../models/transModel');

const mongoose = require('mongoose');

// get all transactions

const getAllTransactions = async (req, res) => {
  try {
    const allTrans = await Transaction.find({}).sort({ createdAt: -1 });
    return res.status(200).json(allTrans);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get a single transaction

const getSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).json({ error: 'No transaction found' });

  try {
    const singleTrans = await Transaction.findById(req.params.id);
    return res.status(200).json(singleTrans);
  } catch (err) {
    return res.status(404).json({ error: 'No transaction found' });
  }
};

// create new transaction

const createTransaction = async (req, res) => {
  const { title, amount, category } = req.body;

  try {
    const newTrans = await Transaction.create({
      title,
      amount,
      category,
    });
    return res.status(200).json(newTrans);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete a single transaction

const deleteSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).json({ error: 'No transaction found' });

  try {
    const deletedTrans = await Transaction.findByIdAndDelete(req.params.id);
    return res.status(200).json(deletedTrans);
  } catch (err) {
    return res.status(404).json({ error: 'No transaction found' });
  }
};

// update a single transaction

const updateSingleTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).json({ error: 'No transaction found' });

  try {
    const updatedTrans = await Transaction.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });
    return res.status(200).json(updatedTrans);
  } catch (err) {
    return res.status(404).json({ error: 'No transaction found' });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  deleteSingleTransaction,
  updateSingleTransaction,
};
