const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel');

/**
 * Updates the user's budget based on changes in account balance.
 * @param {string} userId - The user's database ID.
 * @param {number} balanceChange - The change in balance to be applied to the budget.
 */
async function updateUserBudget(userId, balanceChange) {
  const budget = await Budget.findOne({ user: userId });
  if (!budget) {
    console.error('Budget not found for user:', userId);
    return;
  }

  // Adjusting budget based on account addition, deletion, or balance update
  budget.totalAvailable += balanceChange;
  // Always adjust readyToAssign, as it reflects the total funds available for new assignments
  budget.readyToAssign += balanceChange;

  await budget.save();
}

/**
 * Handles not found accounts consistently across the controller.
 * @param {Object} res - The response object.
 */
const handleAccountNotFound = (res) => res.status(404).json({ error: 'Account not found' });

/**
 * Creates a new account for the logged-in user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
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

    // Update the user's budget upon account creation
    await updateUserBudget(req.user._id, balance);

    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create account' });
  }
};

/**
 * Retrieves all accounts associated with the logged-in user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
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
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccount = await Account.findByIdAndDelete(id);
    if (!deletedAccount) return handleAccountNotFound(res);

    const userBudget = await Budget.findOne({ user: req.user._id });
    if (userBudget) {
      userBudget.totalAvailable -= deletedAccount.balance;
      userBudget.readyToAssign -= deletedAccount.balance; // Allow negative values
      await userBudget.save();
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete account' });
  }
};

/**
 * Updates an account by its ID and adjusts the budget accordingly.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;

  try {
    const accountToUpdate = await Account.findById(id);
    if (!accountToUpdate) return handleAccountNotFound(res);

    // Calculate the difference after finding the original account but before updating it
    const balanceDifference = balance - accountToUpdate.balance;

    // Proceed to update the account
    const updatedAccount = await Account.findByIdAndUpdate(id, { balance }, { new: true });

    // Update the budget to reflect the new balance
    await updateUserBudget(req.user._id, balanceDifference);

    res.status(200).json(updatedAccount);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update account' });
  }
};

/**
 * Calculates and returns the total balance across all accounts of the logged-in user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
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
