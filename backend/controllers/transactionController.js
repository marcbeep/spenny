const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');
const OpenAI = require('openai');
const openai = new OpenAI();
const { checkOwnership } = require('../utils/utils');

const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

const formatAmount = (amount) => Number(amount);

const updateUserBudgetForTransaction = async (userId, amount, addToReadyToAssign) => {
  const budget = await Budget.findOne({ user: userId });
  if (!budget) return;

  if (addToReadyToAssign) {
    budget.budgetReadyToAssign += amount;
  } else {
    budget.budgetTotalAssigned += amount;
  }
  await budget.save();
};

const updateBalances = async ({
  categoryId,
  accountId,
  amount,
  transactionType
}) => {
  const formattedAmount = formatAmount(amount);
  const amountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

  // Update Category if applicable
  if (categoryId) {
    await Category.findByIdAndUpdate(categoryId, {
      $inc: {
        categoryActivity: formattedAmount, // Always increment activity by positive amount
        categoryAvailable: amountChange   // Adjust available funds correctly
      },
    });
  }

  // Update Account
  const account = await Account.findById(accountId);
  if (account) {
    // Ensure all numeric operations are clearly defined
    let currentBalance = parseFloat(account.accountBalance); // Make sure it's a number
    let newBalance = currentBalance + amountChange;
    account.accountBalance = formatAmount(newBalance); // Reformat to maintain consistency
    await account.save();
  }
};

async function verifyCategoryId(userId, categoryId) {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  return !!category;
}

async function verifyAccountId(userId, accountId) {
  const account = await Account.findOne({ _id: accountId, user: userId });
  return !!account;
}

async function createNewTransaction(details) {
  const {
    userId,
    transactionTitle,
    transactionAmount,
    transactionCategory,
    transactionType,
    transactionAccount,
  } = details;

  // Match the object keys with your schema field names
  const newTransaction = new Transaction({
    user: userId,
    transactionTitle: transactionTitle.toLowerCase(),
    transactionAmount: formatAmount(transactionAmount),
    transactionCategory: transactionCategory,
    transactionType: transactionType.toLowerCase(),
    transactionAccount: transactionAccount,
  });

  try {
    await newTransaction.save();
    return newTransaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.getSingleTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return handleNoTransactionFound(res);

    if (!checkOwnership(transaction, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to access this transaction' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

exports.createTransaction = async (req, res) => {
  const {
    transactionTitle,
    transactionType,
    transactionAmount,
    transactionCategory,
    transactionAccount,
  } = req.body;

  const account = await Account.findById(transactionAccount);
  if (!account || account.accountStatus === 'archived') {
    return res.status(403).json({ error: 'Transactions cannot be added to an archived account.' });
  }

  const effectiveTransactionCategory = transactionCategory === '' ? null : transactionCategory;
  const formattedAmount = formatAmount(transactionAmount);
  const amountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

  try {
    const newTransaction = await Transaction.create({
      user: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount: formattedAmount,
      transactionCategory: effectiveTransactionCategory,
      transactionAccount,
    });

    // Update account and category balances
    await updateBalances({
      categoryId: effectiveTransactionCategory,
      accountId: transactionAccount,
      amount: amountChange,
      transactionType: transactionType,
    });

    // Optionally update goal status if linked to a category
    if (effectiveTransactionCategory) {
      await checkAndUpdateGoalStatus(null, effectiveTransactionCategory);
    } else {
      // Update user's budget if no category is linked
      await updateUserBudgetForTransaction(req.user._id, amountChange, transactionType !== 'debit');
    }

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

exports.deleteSingleTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transactionToDelete = await Transaction.findById(id);
    if (!transactionToDelete) return handleNoTransactionFound(res);

    if (!checkOwnership(transaction, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to delete this transaction' });
    }

    if (transactionToDelete.transactionAccount.accountStatus === 'archived') {
      return res
        .status(403)
        .json({ error: 'Transactions linked to archived accounts cannot be deleted.' });
    }

    const amountChange =
      transactionToDelete.transactionType === 'debit'
        ? -transactionToDelete.transactionAmount
        : transactionToDelete.transactionAmount;

    if (transactionToDelete.transactionCategory) {
      await updateBalances({
        categoryId: transactionToDelete.transactionCategory,
        accountId: transactionToDelete.transactionAccount,
        amount: amountChange,
        transactionType: transactionToDelete.transactionType,
        revert: true,
      });
      await checkAndUpdateGoalStatus(null, transactionToDelete.transactionCategory);
    } else {
      await updateUserBudgetForTransaction(req.user._id, amountChange, true);
    }

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

exports.updateSingleTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    transactionTitle,
    transactionType,
    transactionAmount,
    transactionCategory,
    transactionAccount,
  } = req.body;

  const account = await Account.findById(transactionAccount);
  if (account.accountStatus === 'archived') {
    return res.status(403).json({
      error: 'Transaction cannot be edited as it is associated with an archived account.',
    });
  }

  const formattedAmount = formatAmount(transactionAmount);

  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transactionToUpdate = await Transaction.findById(id);
    if (!transactionToUpdate) return handleNoTransactionFound(res);

    if (!checkOwnership(transaction, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this transaction' });
    }

    const originalCategory = transactionToUpdate.transactionCategory
      ? transactionToUpdate.transactionCategory.toString()
      : null;
    const newCategory = transactionCategory === '' ? null : transactionCategory;

    const wasAffectingReadyToAssign = !originalCategory;

    const originalAmountChange =
      transactionToUpdate.transactionType === 'debit'
        ? -transactionToUpdate.transactionAmount
        : transactionToUpdate.transactionAmount;
    const newAmountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

    if (wasAffectingReadyToAssign) {
      await updateUserBudgetForTransaction(req.user._id, -originalAmountChange, true);
    } else {
      await updateBalances({
        categoryId: originalCategory,
        accountId: transactionToUpdate.transactionAccount,
        amount: originalAmountChange,
        transactionType: transactionToUpdate.transactionType,
        revert: true,
      });
    }

    if (newCategory) {
      await updateBalances({
        categoryId: newCategory,
        accountId: transactionAccount,
        amount: newAmountChange,
        transactionType,
      });
    } else {
      await updateUserBudgetForTransaction(req.user._id, newAmountChange, true);
    }

    transactionToUpdate.transactionTitle = transactionTitle;
    transactionToUpdate.transactionType = transactionType;
    transactionToUpdate.transactionAmount = formattedAmount;
    transactionToUpdate.transactionCategory = newCategory;
    transactionToUpdate.transactionAccount = transactionAccount;
    await transactionToUpdate.save();

    if (originalCategory) {
      await checkAndUpdateGoalStatus(null, originalCategory);
    }
    if (newCategory && newCategory !== originalCategory) {
      await checkAndUpdateGoalStatus(null, newCategory);
    }

    res.status(200).json(transactionToUpdate);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(400).json({ error: 'Failed to update transaction' });
  }
};

exports.ai = async (req, res) => {
  try {
    const userId = req.user._id;

    const categories = await Category.find({ user: userId });
    const categoryDictionary = categories.reduce((acc, category) => {
      acc[category._id.toString()] = category.categoryTitle;
      return acc;
    }, {});
    const categoryDictionaryString = JSON.stringify(categoryDictionary, null, 2);

    // Fetch only "spending" type accounts and sort them
    const spendingAccounts = await Account.find({ user: userId, accountType: 'spending' }).sort({
      accountTitle: 1,
      balance: -1,
    }); // Sort alphabetically, then by descending balance

    if (spendingAccounts.length === 0) {
      return res.status(404).json({ error: 'No spending accounts found.' });
    }

    // The first account after sorting will be the one to use
    const accountToUse = spendingAccounts[0]._id.toString();

    const { text } = req.body;
    const prompt = `
Given the following OCR text extracted from a receipt, analyze and fill out the transaction details in JSON format with the following fields (as an example):
{"success": true, "transactionTitle": "Paul's Italiano", "transactionAmount": 20.00, "transactionCategory": "5f4e7b3e4f2e8b2c4c7f5e6d", "transactionType": "debit", "transactionAccount": "${accountToUse}"}
- success: Either true or false. If unable to analyze, return success: false.
- transactionTitle: Generalize the title, e.g., "Paul's Italiano" might mean "Italian Food".
- transactionAmount: The amount in a numeric format, e.g., 20.00.
- transactionCategory: Use one of the provided category IDs based on the category dictionary.
- transactionType: Either "credit" or "debit".
- transactionAccount: The account ID with the highest balance for this analysis is "${accountToUse}".

Category Dictionary (Ensure that the transactionCategory is the categoryID from the provided Category Dictionary.):
${categoryDictionaryString}

OCR Text:
${text}
`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that only outputs data in JSON format.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-3.5-turbo',
    });

    let response = completion.choices[0].message.content;
    const indexOfJsonStart = response.indexOf('{');
    response = indexOfJsonStart !== -1 ? response.slice(indexOfJsonStart) : response;
    const transactionDetails = JSON.parse(response);

    if (!transactionDetails.success) {
      return res
        .status(400)
        .json({ success: false, message: 'AI could not analyze the receipt successfully.' });
    }

    if (transactionDetails.success) {
      const isCategoryValid = await verifyCategoryId(
        userId,
        transactionDetails.transactionCategory,
      );
      const isAccountValid = await verifyAccountId(userId, transactionDetails.transactionAccount);

      if (!isCategoryValid || !isAccountValid) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid category or account ID provided.' });
      }

      const newTransactionDetails = {
        userId,
        transactionTitle: transactionDetails.transactionTitle,
        transactionAmount: transactionDetails.transactionAmount,
        transactionCategory: transactionDetails.transactionCategory,
        transactionType: transactionDetails.transactionType,
        transactionAccount: transactionDetails.transactionAccount,
      };

      const newTransaction = await createNewTransaction(newTransactionDetails);

      return res.status(201).json({
        success: true,
        message: 'Transaction created successfully.',
        transaction: newTransaction,
      });
    }

    res.status(200).json(completion.choices[0]);
  } catch (error) {
    console.error('Error processing AI request:', error);
    res.status(400).json({ error: 'Failed to process AI request' });
  }
};
