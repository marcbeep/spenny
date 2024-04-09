const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');

const formatAmount = (amount) => parseFloat(amount).toFixed(2);

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
        transactionTitle: `[${accountTitle.toLowerCase()}] account creation`,
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

    res.status(200).json(account);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch account' });
  }
};

exports.deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const accountToDelete = await Account.findByIdAndDelete(id);
    if (!accountToDelete) return handleAccountNotFound(res);

    if (accountToDelete.accountType === 'spending') {
      await updateUserBudget(req.user._id, -Number(accountToDelete.accountBalance));
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete account' });
  }
};

exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { accountTitle, accountBalance } = req.body;

  try {
    const accountToUpdate = await Account.findById(id);
    if (!accountToUpdate) return handleAccountNotFound(res);

    const balanceDifference =
      accountBalance !== undefined
        ? Number(formatAmount(accountBalance)) - Number(accountToUpdate.accountBalance)
        : 0;

    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      {
        ...(accountTitle && { accountTitle: accountTitle.toLowerCase() }),
        ...(accountBalance !== undefined && { accountBalance: formatAmount(accountBalance) }),
      },
      { new: true },
    );

    if (accountToUpdate.accountType === 'spending' && balanceDifference !== 0) {
      await updateUserBudget(req.user._id, balanceDifference);
    }

    res.status(200).json(updatedAccount);
  } catch (err) {
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

    if (!fromAccount || !toAccount) return handleAccountNotFound(res);

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
    res.status(400).json({ error: 'Failed to move money between accounts' });
  }
};
