const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const Account = require('../models/accountModel');
const Budget = require('../models/budgetModel');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');
const OpenAI = require('openai');
const openai = new OpenAI();

// Helper Functions

const handleNoTransactionFound = (res) => res.status(404).json({ error: 'Transaction not found' });

const formatAmount = (amount) => {
  return Number(parseFloat(amount).toFixed(2));
};

const updateUserBudgetForTransaction = async (userId, amount, addToReadyToAssign) => {
  const budget = await Budget.findOne({ user: userId });
  if (!budget) return;

  if (addToReadyToAssign) {
    // For transactions directly affecting "Ready to Assign"
    budget.budgetReadyToAssign += amount;
  } else {
    // For transactions within categories, adjust total assigned but not "Ready to Assign"
    budget.budgetTotalAssigned += amount;
  }
  await budget.save();
};

const updateBalances = async ({
  categoryId,
  accountId,
  amount,
  transactionType,
  revert = false,
}) => {
  const multiplier = revert ? -1 : 1;
  const formattedAmount = formatAmount(amount); // Format and round amount
  const amountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

  // Update Category
  await Category.findByIdAndUpdate(categoryId, {
    $inc: {
      categoryActivity: formattedAmount * multiplier,
      categoryAvailable: amountChange * multiplier,
    },
  });

  // Update Account
  const account = await Account.findById(accountId);
  if (account) {
    account.accountBalance = formatAmount(account.accountBalance + amountChange * multiplier);
    await account.save();
  }
};

async function verifyCategoryId(userId, categoryId) {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  return !!category; // Returns true if the category exists and belongs to the user, false otherwise
}

async function verifyAccountId(userId, accountId) {
  const account = await Account.findOne({ _id: accountId, user: userId });
  return !!account; // Returns true if the account exists and belongs to the user, false otherwise
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
    transactionTitle: transactionTitle.toLowerCase(), // Assuming lowercase as per your schema requirements
    transactionAmount: formatAmount(transactionAmount), // Use your formatNumber function
    transactionCategory: transactionCategory, // This can be null/undefined if not provided
    transactionType: transactionType.toLowerCase(), // Assuming lowercase as per your schema requirements
    transactionAccount: transactionAccount,
  });

  try {
    await newTransaction.save();
    return newTransaction; // Returns the created transaction object if successful
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

// Exports

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch transactions' });
  }
};

exports.getSingleTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return handleNoTransactionFound(res);
    res.status(200).json(transaction);
  } catch (err) {
    handleNoTransactionFound(res);
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

  // Convert empty string to null for transactionCategory
  const effectiveTransactionCategory = transactionCategory === '' ? null : transactionCategory;

  const formattedAmount = formatAmount(transactionAmount);
  const amountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

  try {
    // Create a new transaction
    const newTransaction = await Transaction.create({
      user: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount: formattedAmount,
      transactionCategory: effectiveTransactionCategory,
      transactionAccount,
    });

    if (effectiveTransactionCategory) {
      // Update the category and account balances if specified
      await updateBalances({
        categoryId: effectiveTransactionCategory,
        accountId: transactionAccount,
        amount: amountChange,
        transactionType: transactionType,
      });

      // After updating the category, check and update the associated goal's status
      await checkAndUpdateGoalStatus(null, effectiveTransactionCategory); // Update goal status for this category
    } else {
      // Adjust "Ready to Assign" for transactions without a category
      await updateUserBudgetForTransaction(req.user._id, amountChange, true);
    }

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

exports.deleteSingleTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transactionToDelete = await Transaction.findById(id);
    if (!transactionToDelete) return handleNoTransactionFound(res);

    // Determine the effect of the transaction deletion on category and account balances
    const amountChange =
      transactionToDelete.transactionType === 'debit'
        ? transactionToDelete.transactionAmount
        : -transactionToDelete.transactionAmount;

    if (transactionToDelete.transactionCategory) {
      // Reverse the transaction's effect on the category and account
      await updateBalances({
        categoryId: transactionToDelete.transactionCategory,
        accountId: transactionToDelete.transactionAccount,
        amount: amountChange,
        transactionType: transactionToDelete.transactionType,
        revert: true, // Indicate that this is a reversal operation
      });

      // Update the goal status for the affected category
      await checkAndUpdateGoalStatus(null, transactionToDelete.transactionCategory);
    } else {
      // If there was no category, adjust the budget's "Ready to Assign" balance
      await updateUserBudgetForTransaction(req.user._id, -amountChange, true);
    }

    // Proceed to delete the transaction after handling balance adjustments
    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    handleNoTransactionFound(res);
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
  const formattedAmount = formatAmount(transactionAmount);

  if (!mongoose.Types.ObjectId.isValid(id)) return handleNoTransactionFound(res);

  try {
    const transactionToUpdate = await Transaction.findById(id);
    if (!transactionToUpdate) return handleNoTransactionFound(res);

    // Check for changes in transaction category
    const originalCategory = transactionToUpdate.transactionCategory
      ? transactionToUpdate.transactionCategory.toString()
      : null;
    const newCategory = transactionCategory === '' ? null : transactionCategory;

    // Determine if the transaction was originally affecting "Ready to Assign"
    const wasAffectingReadyToAssign = !originalCategory;

    // Calculate the original and new amount changes
    const originalAmountChange =
      transactionToUpdate.transactionType === 'debit'
        ? -transactionToUpdate.transactionAmount
        : transactionToUpdate.transactionAmount;
    const newAmountChange = transactionType === 'debit' ? -formattedAmount : formattedAmount;

    // If the original transaction did not have a category, reverse its effect on "Ready to Assign"
    if (wasAffectingReadyToAssign) {
      await updateUserBudgetForTransaction(req.user._id, -originalAmountChange, true);
    } else {
      // If it had a category, reverse its category effect
      await updateBalances({
        categoryId: originalCategory,
        accountId: transactionToUpdate.transactionAccount,
        amount: originalAmountChange,
        transactionType: transactionToUpdate.transactionType,
        revert: true,
      });
    }

    // Apply new transaction's effects based on the updated details
    if (newCategory) {
      await updateBalances({
        categoryId: newCategory,
        accountId: transactionAccount,
        amount: newAmountChange,
        transactionType,
      });
    } else {
      // If now no category, directly adjust "Ready to Assign"
      await updateUserBudgetForTransaction(req.user._id, newAmountChange, true);
    }

    // Update the transaction with new details
    transactionToUpdate.transactionTitle = transactionTitle;
    transactionToUpdate.transactionType = transactionType;
    transactionToUpdate.transactionAmount = formattedAmount;
    transactionToUpdate.transactionCategory = newCategory;
    transactionToUpdate.transactionAccount = transactionAccount;
    await transactionToUpdate.save();

    // Update goals if categories are involved
    if (originalCategory) {
      await checkAndUpdateGoalStatus(null, originalCategory); // Update for original category
    }
    if (newCategory && newCategory !== originalCategory) {
      await checkAndUpdateGoalStatus(null, newCategory); // Update for new category if different
    }

    res.status(200).json(transactionToUpdate);
  } catch (err) {
    console.error(err); // Detailed error logging
    res.status(400).json({ error: 'Failed to update transaction' });
  }
};

exports.ai = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch Categories specific to the user and Transform into Dictionary
    const categories = await Category.find({ user: userId });
    // console.log("Categories for User: ", categories);

    const categoryDictionary = categories.reduce((acc, category) => {
      acc[category._id.toString()] = category.categoryTitle;
      return acc;
    }, {});

    // Prepare the category dictionary for inclusion in the prompt
    const categoryDictionaryString = JSON.stringify(categoryDictionary, null, 2);
    // console.log("Category Dictionary for User:", categoryDictionaryString);

    // Find the account with the highest balance for this user
    const accounts = await Account.find({ user: userId });
    const accountWithHighestBalance = accounts.reduce(
      (max, account) => (max.balance > account.balance ? max : account),
      accounts[0],
    );
    const accountToUse = accountWithHighestBalance._id.toString(); // Convert the ID to string

    // Adjust the Prompt to Include Category Dictionary and Refine for Clarity
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
    // Find the index of the first opening brace `{`
    const indexOfJsonStart = response.indexOf('{');
    // If found, slice the string from this index; if not, keep the content as is
    response = indexOfJsonStart !== -1 ? response.slice(indexOfJsonStart) : response;
    const transactionDetails = JSON.parse(response);

    console.log('Transaction Details: ', transactionDetails);

    if (!transactionDetails.success) {
      return res
        .status(400)
        .json({ success: false, message: 'AI could not analyze the receipt successfully.' });
    }

    // After parsing the AI response...
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

      // IDs are verified; now, create a new transaction
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
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to process AI request' });
  }
};
