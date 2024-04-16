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

const updateBalances = async ({ categoryId, accountId, amount, transactionType }) => {
  // Calculate the amount change based on the transaction type: subtract for debit, add for credit
  const amountChange = transactionType === 'debit' ? -amount : amount;

  // Log details for debugging purposes
  console.log('amount:', amount);
  console.log('transactionType:', transactionType);
  console.log('amountChange:', amountChange);

  // Update category balances if a categoryId is provided
  if (categoryId) {
    await Category.findByIdAndUpdate(categoryId, {
      $inc: {
        categoryActivity: Math.abs(amount), // Increment activity by the absolute transaction amount
        categoryAvailable: amountChange, // Update available funds based on the transaction type
      },
    });
  }

  // Update the account balance
  const account = await Account.findById(accountId);
  if (account) {
    let newBalance = account.accountBalance + amountChange; // Compute the new balance
    account.accountBalance = formatAmount(newBalance); // Format the new balance for consistency
    await account.save(); // Save the updated account
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

  // Check if the specified account is available and not archived
  const account = await Account.findById(transactionAccount);
  if (!account || account.accountStatus === 'archived') {
    return res.status(403).json({ error: 'Transactions cannot be added to an archived account.' });
  }

  // Handle case where no category is specified
  const effectiveTransactionCategory = transactionCategory === '' ? null : transactionCategory;

  // Determine the effect of the transaction type on the amount: debit reduces, credit increases
  const amountChange = transactionType === 'debit' ? -transactionAmount : transactionAmount;

  try {
    // Create and save the new transaction with the amount formatted for consistency
    const newTransaction = await Transaction.create({
      user: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount: formatAmount(transactionAmount), // Format amount for storage
      transactionCategory: effectiveTransactionCategory,
      transactionAccount,
    });

    // Update balances in accounts and categories as per the transaction effect
    await updateBalances({
      categoryId: effectiveTransactionCategory,
      accountId: transactionAccount,
      amount: transactionAmount,
      transactionType: transactionType,
    });

    // Update goal status if a category is linked to the transaction
    if (effectiveTransactionCategory) {
      await checkAndUpdateGoalStatus(null, effectiveTransactionCategory);
    } else {
      // If no category is linked, adjust the user's budget according to the transaction type
      await updateUserBudgetForTransaction(req.user._id, amountChange, transactionType !== 'debit');
    }

    // Respond with the newly created transaction details
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

    if (!checkOwnership(transactionToDelete, req.user._id)) {
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

// exports.updateSingleTransaction = async (req, res) => {
//   const { id } = req.params;
//   const {
//     transactionTitle,
//     transactionType,
//     transactionAmount,
//     transactionCategory,
//     transactionAccount,
//   } = req.body;

//   const account = await Account.findById(transactionAccount);
//   if (account.accountStatus === 'archived') {
//     return res.status(403).json({
//       error: 'Transaction cannot be edited as it is associated with an archived account.',
//     });
//   }

//   const formattedAmount = formatAmount(transactionAmount);

//   if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

//   try {
//     const transactionToUpdate = await Transaction.findById(id);
//     if (!transactionToUpdate) return handleNoTransactionFound(res);

//     if (!checkOwnership(transactionToUpdate, req.user._id)) {
//       return res.status(403).json({ error: 'Unauthorized to modify this transaction' });
//     }

//     const originalCategory = transactionToUpdate.transactionCategory
//       ? transactionToUpdate.transactionCategory.toString()
//       : null;
//     const newCategory = transactionCategory === '' ? null : transactionCategory;

//     const wasAffectingReadyToAssign = !originalCategory;

//     const originalAmountChange =
//       transactionToUpdate.transactionType === 'debit'
//         ? -transactionToUpdate.transactionAmount
//         : transactionToUpdate.transactionAmount;
//     const newAmountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

//     if (wasAffectingReadyToAssign) {
//       await updateUserBudgetForTransaction(req.user._id, -originalAmountChange, true);
//     } else {
//       await updateBalances({
//         categoryId: originalCategory,
//         accountId: transactionToUpdate.transactionAccount,
//         amount: originalAmountChange,
//         transactionType: transactionToUpdate.transactionType,
//         revert: true,
//       });
//     }

//     if (newCategory) {
//       await updateBalances({
//         categoryId: newCategory,
//         accountId: transactionAccount,
//         amount: newAmountChange,
//         transactionType,
//       });
//     } else {
//       await updateUserBudgetForTransaction(req.user._id, newAmountChange, true);
//     }

//     transactionToUpdate.transactionTitle = transactionTitle;
//     transactionToUpdate.transactionType = transactionType;
//     transactionToUpdate.transactionAmount = formattedAmount;
//     transactionToUpdate.transactionCategory = newCategory;
//     transactionToUpdate.transactionAccount = transactionAccount;
//     await transactionToUpdate.save();

//     if (originalCategory) {
//       await checkAndUpdateGoalStatus(null, originalCategory);
//     }
//     if (newCategory && newCategory !== originalCategory) {
//       await checkAndUpdateGoalStatus(null, newCategory);
//     }

//     res.status(200).json(transactionToUpdate);
//   } catch (error) {
//     console.error('Error updating transaction:', error);
//     res.status(400).json({ error: 'Failed to update transaction' });
//   }
// };

exports.updateSingleTransaction = async (req, res) => {
  const { id } = req.params;
  const { transactionAmount } = req.body; // Only allow transactionAmount to be updated

  try {
    const transactionToUpdate = await Transaction.findById(id);
    if (!transactionToUpdate) return res.status(404).json({ error: 'Transaction not found' });

    if (!checkOwnership(transactionToUpdate, req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this transaction' });
    }

    if (transactionToUpdate.transactionAccount.accountStatus === 'archived') {
      return res.status(403).json({
        error: 'Transaction cannot be edited as it is associated with an archived account.',
      });
    }

    const formattedAmount = formatAmount(transactionAmount);

    // Calculate the amount change and update balances accordingly
    const originalAmountChange =
      transactionToUpdate.transactionType === 'debit'
        ? -transactionToUpdate.transactionAmount
        : transactionToUpdate.transactionAmount;
    const newAmountChange =
      transactionToUpdate.transactionType === 'debit' ? -formattedAmount : formattedAmount;
    const amountChange = newAmountChange - originalAmountChange;

    if (transactionToUpdate.transactionCategory) {
      await updateBalances({
        categoryId: transactionToUpdate.transactionCategory,
        accountId: transactionToUpdate.transactionAccount,
        amount: amountChange,
        transactionType: transactionToUpdate.transactionType,
      });
    } else {
      await updateUserBudgetForTransaction(req.user._id, amountChange, true);
    }

    // Only update the transaction amount
    transactionToUpdate.transactionAmount = formattedAmount;
    await transactionToUpdate.save();

    res
      .status(200)
      .json({ message: 'Transaction updated successfully', transaction: transactionToUpdate });
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

// returns the transaction id, transaction title, associated category name, transaction amount, transaction type, and transaction account name
exports.transactionTable = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'transactionCategory',
        select: 'categoryTitle'  // Only fetch the category title
      })
      .populate({
        path: 'transactionAccount',
        select: 'accountTitle'  // Only fetch the account title
      });

    const transactionDetails = transactions.map(transaction => ({
      transactionId: transaction._id,
      transactionTitle: transaction.transactionTitle,
      categoryName: transaction.transactionCategory ? transaction.transactionCategory.categoryTitle : '',
      transactionAmount: transaction.transactionAmount,
      transactionType: transaction.transactionType,
      accountName: transaction.transactionAccount ? transaction.transactionAccount.accountTitle : ''
    }));

    res.status(200).json(transactionDetails);
  } catch (error) {
    console.error('Error fetching transaction table:', error);
    res.status(500).json({ error: 'Failed to fetch transaction details' });
  }
};
