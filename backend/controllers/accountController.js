const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel'); // Import if you're planning to update Budget in account operations

/**
 * Handles not found accounts consistently across the controller.
 */
const handleAccountNotFound = (res) => res.status(404).json({ error: 'Account not found' });

/**
 * Creates a new account for the logged-in user.
 */
exports.addAccount = async (req, res) => {
  const { title, type, balance } = req.body;

  try {
    const account = await Account.create({
      user: req.user._id,
      title,
      type,
      balance,
    });

    // Update totalAvailable in BudgetModel 
    const userBudget = await Budget.findOne({ user: req.user._id });
    if (userBudget) {
      userBudget.totalAvailable += balance;
      await userBudget.save();
    }

    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create account' });
  }
};

/**
 * Retrieves all accounts associated with the logged-in user.
 */
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch accounts' });
  }
};

/**
 * Deletes an account by its ID and updates budget accordingly.
 */
exports.deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccount = await Account.findByIdAndDelete(id);
    if (!deletedAccount) return handleAccountNotFound(res);

    // Adjust BudgetModel totalAvailable 
    const userBudget = await Budget.findOne({ user: req.user._id });
    if (userBudget) {
      userBudget.totalAvailable -= deletedAccount.balance;
      await userBudget.save();
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete account' });
  }
};

/**
 * Updates an account by its ID.
 */
exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { title, type, balance } = req.body;

  try {
    const updatedAccount = await Account.findByIdAndUpdate(
      id, 
      { title, type, balance },
      { new: true }
    );
    if (!updatedAccount) return handleAccountNotFound(res);

    // Update totalAvailable in BudgetModel 
    const userBudget = await Budget.findOne({ user: req.user._id });
    if (userBudget) {
      const difference = balance - updatedAccount.balance;
      userBudget.totalAvailable += difference;
      await userBudget.save();
    }

    res.status(200).json(updatedAccount);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update account' });
  }
};

/**
 * Calculates and returns the total balance across all accounts of the logged-in user.
 */
exports.getTotalBalance = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
    res.status(200).json({ totalBalance });
  } catch (err) {
    res.status(400).json({ error: 'Failed to calculate total balance' });
  }
};

