const Account = require('../models/accountModel');

const handleAccountNotFound = (res) => res.status(404).json({ error: 'Account not found' });

exports.addAccount = async (req, res) => {
  try {
    const account = await Account.create({ ...req.body, user: req.user._id });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await Account.findByIdAndDelete(req.params.id);
    if (!deleted) return handleAccountNotFound(res);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!account) return handleAccountNotFound(res);
    res.status(200).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTotalBalance = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
    res.status(200).json({ totalBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
