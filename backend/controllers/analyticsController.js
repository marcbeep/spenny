const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const Goal = require('../models/goalModel');

const moment = require('moment');

// Stat cards (All time)

exports.statCards = async (req, res) => {
  const userId = req.user._id;

  try {
    // Calculate all-time net worth
    const accounts = await Account.find({ user: userId });
    const netWorth = accounts.reduce((acc, account) => acc + account.accountBalance, 0);

    // Calculate all-time savings rate
    const transactions = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0,
      totalExpenditure = 0;
    transactions.forEach((transaction) => {
      if (transaction._id === 'credit') totalIncome += transaction.total;
      if (transaction._id === 'debit') totalExpenditure += transaction.total;
    });
    const savingsRate = totalIncome
      ? (((totalIncome - totalExpenditure) / totalIncome) * 100).toFixed(2)
      : '0.00';

    // Calculate goals funded
    const goals = await Goal.find({ user: userId });
    const goalsFunded = goals.length
      ? goals.filter((goal) => goal.goalStatus === 'funded').length
      : 0;

    // Calculate average daily spend for the last week
    const endOfToday = moment().endOf('day');
    const startOfSevenDaysAgo = moment().subtract(6, 'days').startOf('day');
    const outgoings = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'debit',
          createdAt: { $gte: startOfSevenDaysAgo.toDate(), $lte: endOfToday.toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalSpendLastWeek = outgoings.reduce((acc, cur) => acc + cur.total, 0);
    const averageDailySpend = totalSpendLastWeek ? (totalSpendLastWeek / 7).toFixed(2) : '0.00';

    // Compile response data
    const response = {
      netWorth: `${netWorth.toFixed(2)}`,
      savingsRate: `${savingsRate}`,
      goalsFunded: `${goalsFunded} / ${goals.length}`,
      averageDailySpend: `${averageDailySpend}`,
    };

    res.status(200).json({
      message: 'Statistics for dashboard cards generated successfully.',
      data: response,
    });
  } catch (error) {
    console.error('Error generating statistics for dashboard cards:', error);
    res.status(500).json({
      error: 'Failed to generate statistics for dashboard cards.',
      details: error.message,
    });
  }
};

// Last 5 Transactions
exports.lastFiveTransactions = async (req, res) => {
  const userId = req.user._id;

  try {
    const lastFiveTransactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Mapping the response to format it with the direct category and account names
    const formattedTransactions = lastFiveTransactions.map((transaction) => ({
      _id: transaction._id,
      transactionTitle: transaction.transactionTitle,
      createdAt: new Date(transaction.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      transactionType: transaction.transactionType,
      transactionAmount: transaction.transactionAmount.toFixed(2),
    }));

    res.status(200).json({
      message: 'Successfully retrieved the last five transactions',
      data: formattedTransactions,
    });
  } catch (error) {
    console.error('Error retrieving last five transactions:', error);
    res.status(500).json({
      error: 'Failed to retrieve transactions',
      details: error.message,
    });
  }
};

// Outgoings (Past week)

const calculateDailyOutgoingsForLastWeek = async (userId) => {
  const endOfToday = moment().endOf('day'); // Get the end of today to include all of today's transactions
  const startOfSevenDaysAgo = moment().subtract(6, 'days').startOf('day'); // Start from the beginning of the day, 6 days ago

  console.log(`Calculating from ${startOfSevenDaysAgo.toDate()} to ${endOfToday.toDate()}`);

  const aggregation = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        transactionType: 'debit',
        createdAt: { $gte: startOfSevenDaysAgo.toDate(), $lte: endOfToday.toDate() },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalAmount: { $sum: '$transactionAmount' },
      },
    },
    { $sort: { _id: 1 } }, // Ensure results are sorted by date ascending
  ]);

  console.log(`Aggregation Results: ${JSON.stringify(aggregation)}`);

  // Initialize an array for the 7 days with zeros
  let totals = new Array(7).fill(0);

  // Map each aggregation result to the correct day in the totals array
  aggregation.forEach((item) => {
    let dayIndex = moment(item._id).diff(startOfSevenDaysAgo, 'days'); // Calculate the index based on the difference in days
    if (dayIndex >= 0 && dayIndex < 7) {
      totals[dayIndex] = item.totalAmount; // Set the total amount for the corresponding day
    }
  });

  return totals;
};

exports.dailySpendLastWeek = async (req, res) => {
  const userId = req.user._id;

  try {
    const dailyOutgoings = await calculateDailyOutgoingsForLastWeek(userId);
    res.status(200).json({
      message: 'Daily spend for last week calculated successfully.',
      dailyOutgoings,
    });
  } catch (error) {
    console.error('Error calculating daily outgoings:', error);
    res.status(500).json({ error: 'Failed to calculate daily outgoings.' });
  }
};

// Spend by Category (All time)

async function calculateSpendingByCategoryForUserId(userId) {
  try {
    // Aggregate transactions by category for all time, filtering out uncategorized transactions
    const transactions = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          transactionType: 'debit', // Only debit transactions count as spending
          transactionCategory: { $ne: null }, // Exclude transactions without a category
        },
      },
      {
        $group: {
          _id: '$transactionCategory', // Group by transaction category ID
          totalAmount: { $sum: '$transactionAmount' }, // Sum up all amounts per category
        },
      },
    ]);

    // Fetch all categories for this user, sorted alphabetically by title
    const categories = await Category.find({ user: userId }).sort('categoryTitle');

    // Calculate the total spend to normalize data to percentages
    const totalSpend = transactions.reduce((acc, cur) => acc + cur.totalAmount, 0);

    // Prepare arrays for categories and their corresponding total spend as percentages
    let categoriesArray = [];
    let percentagesArray = [];

    categories.forEach((category) => {
      const transaction = transactions.find(
        (t) => t._id && t._id.toString() === category._id.toString(),
      );
      const totalAmount = transaction ? transaction.totalAmount : 0;
      const percentage = totalSpend > 0 ? ((totalAmount / totalSpend) * 100).toFixed(2) : 0;
      categoriesArray.push(category.categoryTitle);
      percentagesArray.push(parseFloat(percentage));
    });

    return { categories: categoriesArray, percentages: percentagesArray };
  } catch (error) {
    console.error('Failed to calculate spending by category:', error);
    throw new Error('Failed to calculate spending by category: ' + error.message);
  }
}

exports.spendByCategoryAllTime = async (req, res) => {
  const userId = req.user._id;

  try {
    const { categories, percentages } = await calculateSpendingByCategoryForUserId(userId);
    if (!percentages.some((percentage) => percentage > 0)) {
      return res.status(200).json({
        message: 'No spending data available.',
        categories: [],
        percentages: [],
      });
    }
    res.status(200).json({
      message: 'Spending by category analytics updated successfully.',
      categories,
      percentages,
    });
  } catch (error) {
    console.error('Error calculating spending by category:', error);
    res.status(500).json({
      error: 'Failed to calculate spending by category.',
      details: error.message,
    });
  }
};

// Available to Spend
exports.availableToSpend = async (req, res) => {
  const userId = req.user._id; // Assumes user ID is extracted from the authentication middleware

  try {
    // Fetch all categories for this user, sorted alphabetically by title
    const categories = await Category.find({ user: userId }).sort('categoryTitle');

    // Prepare arrays for categories and their corresponding available-to-spend amounts
    const categoryNames = categories.map((category) => category.categoryTitle);
    const availableAmounts = categories.map((category) =>
      category.categoryAvailable > 0 ? category.categoryAvailable : 0,
    );

    res.status(200).json({
      message: 'Successfully retrieved available to spend amounts.',
      categories: categoryNames,
      availableToSpend: availableAmounts,
    });
  } catch (error) {
    console.error('Error retrieving available to spend amounts:', error);
    res.status(500).json({
      error: 'Failed to retrieve available to spend amounts.',
      details: error.message,
    });
  }
};

// Account Balances
exports.accountBalances = async (req, res) => {
  const userId = req.user._id; // Assumes user ID is extracted from the authentication middleware

  try {
    // Fetch all accounts for this user
    const accounts = await Account.find({ user: userId }).sort('accountName');

    // Prepare arrays for account names and their corresponding non-negative balances
    const accountNames = accounts.map((account) => account.accountTitle);
    const balances = accounts.map((account) => Math.max(0, account.accountBalance)); // Ensures negative balances are returned as zero

    res.status(200).json({
      message: 'Successfully retrieved account balances.',
      accounts: accountNames,
      balances: balances,
    });
  } catch (error) {
    console.error('Error retrieving account balances:', error);
    res.status(500).json({
      error: 'Failed to retrieve account balances.',
      details: error.message,
    });
  }
};
