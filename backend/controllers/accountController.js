const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');
const { checkOwnership } = require('../utils/utils');

const formatAmount = (amount) => Number(amount);

const updateUserBudget = async (userId, balanceChange) => {
  try {
    const budget = await Budget.findOne({ user: userId });
    if (budget) {
      budget.budgetTotalAvailable = formatAmount(
        Number(budget.budgetTotalAvailable) + balanceChange,
      );
      budget.budgetReadyToAssign = formatAmount(Number(budget.budgetReadyToAssign) + balanceChange);
      await budget.save();
    }
  } catch (err) {
    throw new Error('Failed to update user budget');
  }
};

const calculateBudgetImpact = (fromAccount, toAccount, amount) => {
  let impact = 0;
  if (fromAccount.accountType === 'spending') impact -= amount;
  if (toAccount.accountType === 'spending') impact += amount;
  return impact;
};

const updateAccountBalance = async (account, change) => {
  try {
    account.accountBalance = formatAmount(Number(account.accountBalance) + change);
    await account.save();
  } catch (err) {
    throw new Error('Failed to update account balance');
  }
};

const handleAccountNotFound = (res) => res.status(404).json({ error: 'Account not found' });

exports.addAccount = async (req, res) => {
  const { accountTitle, accountType, accountBalance } = req.body;
  const formattedBalance = formatAmount(accountBalance);

  try {
    const account = await Account.create({
      user: req.user._id,
      accountTitle: accountTitle.toLowerCase(),
      accountType: accountType.toLowerCase(),
      accountBalance: formattedBalance,
    });

    // Check if the account type is 'spending' before creating a transaction
    if (account.accountType === 'spending') {
      await Transaction.create({
        user: req.user._id,
        transactionAccount: account._id,
        transactionType: 'credit',
        transactionTitle: `[${accountTitle.toLowerCase()} account creation]`,
        transactionAmount: formattedBalance,
      });

      await updateUserBudget(req.user._id, Number(formattedBalance));
    }

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

exports.getAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const account = await Account.findById(id);
    if (!account) return handleAccountNotFound(res);

    // Check ownership
    if (!checkOwnership(account, req.user._id)) {
      return res.status(403).json({ error: 'User does not have permission to view this account' });
    }

    res.status(200).json(account);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch account' });
  }
};

exports.archiveAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const accountToArchive = await Account.findById(id);
    if (!accountToArchive) return handleAccountNotFound(res);

    if (!checkOwnership(accountToArchive, req.user._id)) {
      return res
        .status(403)
        .json({ error: 'User does not have permission to archive this account' });
    }

    // Check if the account is already archived
    if (accountToArchive.accountStatus === 'archived') {
      return res.status(400).json({ error: 'This account is already archived' });
    }

    // Adjust "Ready to Assign" based on the account balance
    const adjustment =
      accountToArchive.accountType === 'spending' ? -accountToArchive.accountBalance : 0;
    await updateUserBudget(req.user._id, adjustment);

    // Update account status to 'archived'
    accountToArchive.accountStatus = 'archived';
    await accountToArchive.save();

    res.status(200).json({ message: 'Account successfully archived' });
  } catch (err) {
    console.error('Error archiving account:', err);
    res.status(500).json({ error: 'Failed to archive account' });
  }
};

exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { accountBalance } = req.body;

  try {
    const accountToUpdate = await Account.findById(id);
    if (!accountToUpdate) return res.status(404).json({ error: 'Account not found' });

    // Prevent updates to archived accounts
    if (accountToUpdate.accountStatus === 'archived') {
      return res.status(403).json({ error: 'Updates to archived accounts are not allowed' });
    }

    if (!checkOwnership(accountToUpdate, req.user._id)) {
      return res
        .status(403)
        .json({ error: 'User does not have permission to update this account' });
    }

    if (typeof accountBalance !== 'number') {
      return res.status(400).json({ error: 'Invalid balance value provided' });
    }

    const currentBalance = accountToUpdate.accountBalance;
    const newBalance = formatAmount(accountBalance);
    const balanceDifference = newBalance - currentBalance;

    // Only proceed with updates if there is a balance difference
    if (balanceDifference !== 0) {
      accountToUpdate.accountBalance = newBalance;

      // Create a reconciliation transaction
      const transactionType = balanceDifference > 0 ? 'credit' : 'debit';
      const reconciliationTitle =
        balanceDifference > 0
          ? 'Balance increase reconciliation'
          : 'Balance decrease reconciliation';
      await Transaction.create({
        user: req.user._id,
        transactionAccount: accountToUpdate._id,
        transactionType: transactionType,
        transactionTitle: `[${accountToUpdate.accountTitle}] ${reconciliationTitle}`,
        transactionAmount: Math.abs(balanceDifference),
      });

      // Update the user's budget if it's a spending account
      if (accountToUpdate.accountType === 'spending') {
        await updateUserBudget(req.user._id, balanceDifference);
      }

      await accountToUpdate.save();
    }

    res.status(200).json(accountToUpdate);
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(400).json({ error: 'Failed to update account' });
  }
};

exports.moveMoneyBetweenAccounts = async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  const formattedAmount = Number(formatAmount(amount));

  try {
    const [fromAccount, toAccount] = await Promise.all([
      Account.findById(fromAccountId),
      Account.findById(toAccountId),
    ]);

    // Account existence check
    if (!fromAccount || !toAccount) return handleAccountNotFound(res);

    // Check for archived accounts
    if (fromAccount.accountStatus === 'archived' || toAccount.accountStatus === 'archived') {
      return res.status(403).json({ error: 'Cannot move money to or from archived accounts.' });
    }

    // Ownership check
    if (
      fromAccount.user.toString() !== req.user._id.toString() ||
      toAccount.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Unauthorized to move money between these accounts.' });
    }

    // Check for moving money between the same account
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: 'Cannot move money within the same account.' });
    }

    const budgetImpact = calculateBudgetImpact(fromAccount, toAccount, formattedAmount);

    await Promise.all([
      updateAccountBalance(fromAccount, -formattedAmount),
      updateAccountBalance(toAccount, formattedAmount),
    ]);

    if (budgetImpact !== 0) {
      await updateUserBudget(req.user._id, budgetImpact);
    }

    res.status(200).json({ message: 'Money moved successfully.' });
  } catch (err) {
    console.error('Error moving money between accounts:', err);
    res.status(400).json({ error: 'Failed to move money between accounts' });
  }
};

exports.getSpendingBalance = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('No user ID found in request');
      return res.status(400).json({ error: 'User ID is missing' });
    }

    const accounts = await Account.find({
      user: req.user._id,
      accountType: 'spending',
    });

    if (!accounts) {
      console.error('No accounts found for user:', req.user._id);
      return res.status(404).json({ error: 'No spending accounts found' });
    }

    const totalSpendingBalance = accounts.reduce(
      (total, account) => total + account.accountBalance,
      0,
    );
    res.status(200).json({ totalSpendingBalance });
  } catch (err) {
    console.error('Error fetching spending balance:', err);
    res.status(400).json({ error: 'Failed to fetch spending balance', details: err.message });
  }
};
