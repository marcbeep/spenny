const Account = require('../models/accountModel');

// Helper function for not found response
const handleAccountNotFound = (res) => res.status(404).json({ error: 'Account not found' });

// Add a new account
exports.addAccount = async (req, res) => {
  const { name, type, balance } = req.body;
  const userId = req.user._id;

  try {
    const account = await Account.create({ user: userId, name, type, balance });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List all accounts for a user
exports.getAccounts = async (req, res) => {
  const userId = req.user._id;

  try {
    const accounts = await Account.find({ user: userId });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a single account
exports.deleteAccount = async (req, res) => {
  const accountId = req.params.id;

  try {
    const account = await Account.findById(accountId);
    if (!account) {
      return handleAccountNotFound(res);
    }
    await account.remove();
    res.status(204).end(); // No content to send back
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a single account
exports.updateAccount = async (req, res) => {
  const accountId = req.params.id;
  const { name, type, balance } = req.body;

  try {
    const account = await Account.findByIdAndUpdate(accountId, { name, type, balance }, { new: true });
    if (!account) {
      return handleAccountNotFound(res);
    }
    res.status(200).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get total balance across all accounts for a user
exports.getTotalBalance = async (req, res) => {
  const userId = req.user._id;

  try {
    const accounts = await Account.find({ user: userId });
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

    res.status(200).json({ totalBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
