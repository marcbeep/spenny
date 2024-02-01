const Account = require('../models/accountModel');

// Add a new account
exports.addAccount = async (req, res) => {
    const { name, type, balance } = req.body;
    const userId = req.user._id; // Assuming middleware to decode JWT and add user to req
  
    try {
      const account = await Account.create({ user: userId, name, type, balance });
      res.status(201).json(account);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  // List all accounts for a user
exports.getAccounts = async (req, res) => {
    const userId = req.user._id; // Assuming middleware to decode JWT and add user to req
  
    try {
      const accounts = await Account.find({ user: userId });
      res.status(200).json(accounts);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  // Implement update and delete operations similarly

  // Get total balance across all accounts for a user
exports.getTotalBalance = async (req, res) => {
    const userId = req.user._id; // Assuming middleware to decode JWT and add user to req
  
    try {
      const accounts = await Account.find({ user: userId });
      const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
  
      res.status(200).json({ totalBalance });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };