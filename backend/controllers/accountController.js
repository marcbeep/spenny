const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel');

// Utility function to update the user's budget based on account balance changes
async function updateUserBudget(userId, balanceChange) {
  try {
    const budget = await Budget.findOne({ user: userId });
    if (!budget) {
      console.error('Budget not found for user:', userId);
      return;
    }

    budget.budgetTotalAvailable += balanceChange;
    budget.budgetReadyToAssign += balanceChange;
    await budget.save();
  } catch (err) {
    console.error('Error updating user budget:', err);
  }
}

// Shared function to handle account not found errors
const handleAccountNotFound = res => res.status(404).json({ error: 'Account not found' });

exports.addAccount = async (req, res) => {
  const { accountTitle, accountType, accountBalance } = req.body;

  try {
    const account = await Account.create({
      user: req.user._id,
      accountTitle: accountTitle.toLowerCase(), 
      accountType: accountType.toLowerCase(), 
      accountBalance: Number(accountBalance), // Ensure numeric conversion
    });

    await updateUserBudget(req.user._id, account.accountBalance);
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create account' });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch accounts' });
  }
};

exports.deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const accountToDelete = await Account.findByIdAndDelete(id);
    if (!accountToDelete) return handleAccountNotFound(res);

    await updateUserBudget(req.user._id, -accountToDelete.accountBalance);
    res.sendStatus(204); // No content to send back
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete account' });
  }
};

exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { accountBalance } = req.body;

  try {
    const accountToUpdate = await Account.findById(id);
    if (!accountToUpdate) return handleAccountNotFound(res);

    const balanceDifference = accountBalance - accountToUpdate.accountBalance;
    const updatedAccount = await Account.findByIdAndUpdate(id, { accountBalance }, { new: true });

    await updateUserBudget(req.user._id, balanceDifference);
    res.status(200).json(updatedAccount);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update account' });
  }
};

exports.getTotalBalance = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    const totalBalance = accounts.reduce((acc, account) => acc + account.accountBalance, 0);
    res.status(200).json({ totalBalance });
  } catch (err) {
    res.status(400).json({ error: 'Failed to calculate total balance' });
  }
};
