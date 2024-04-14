const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Analytics = require('../models/analyticsModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const Goal = require('../models/goalModel');

const moment = require('moment');

// Stat cards

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

        let totalIncome = 0, totalExpenditure = 0;
        transactions.forEach(transaction => {
            if (transaction._id === 'credit') totalIncome += transaction.total;
            if (transaction._id === 'debit') totalExpenditure += transaction.total;
        });
        const savingsRate = totalIncome ? ((totalIncome - totalExpenditure) / totalIncome * 100).toFixed(2) : '0.00';

        // Calculate goals funded
        const goals = await Goal.find({ user: userId });
        const goalsFunded = goals.length ? goals.filter(goal => goal.goalStatus === 'funded').length : 0;

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
            averageDailySpend: `${averageDailySpend}`
        };

        res.status(200).json({
            message: 'Statistics for dashboard cards generated successfully.',
            data: response
        });
    } catch (error) {
        console.error('Error generating statistics for dashboard cards:', error);
        res.status(500).json({
            error: 'Failed to generate statistics for dashboard cards.',
            details: error.message
        });
    }
};

// Last 5 Transactions
exports.lastFiveTransactions = async (req, res) => {
  const userId = req.user._id; 

  try {
      const lastFiveTransactions = await Transaction.find({ user: userId })
          .sort({ createdAt: -1 }) 
          .limit(5) 
          .populate('transactionCategory', 'categoryName') // Ensures only categoryName is fetched
          .populate('transactionAccount', 'accountName'); // Ensures only accountName is fetched

      // Mapping the response to format it with the direct category and account names
      const formattedTransactions = lastFiveTransactions.map(transaction => ({
          _id: transaction._id,
          transactionTitle: transaction.transactionTitle,
          transactionType: transaction.transactionType,
          transactionAmount: transaction.transactionAmount,
          transactionCategory: transaction.transactionCategory ? transaction.transactionCategory.categoryName : "No Category",
          transactionAccount: transaction.transactionAccount ? transaction.transactionAccount.accountName : "No Account",
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          __v: transaction.__v,
      }));

      res.status(200).json({
          message: "Successfully retrieved the last five transactions",
          data: formattedTransactions
      });
  } catch (error) {
      console.error('Error retrieving last five transactions:', error);
      res.status(500).json({
          error: "Failed to retrieve transactions",
          details: error.message
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

exports.outgoingsPastWeek = async (req, res) => {
  const userId = req.user._id;

  try {
    const dailyOutgoings = await calculateDailyOutgoingsForLastWeek(userId);
    res.status(200).json({
      message: 'Daily outgoings calculated successfully.',
      dailyOutgoings,
    });
  } catch (error) {
    console.error('Error calculating daily outgoings:', error);
    res.status(500).json({ error: 'Failed to calculate daily outgoings.' });
  }
};

// Spend by Category (Past week)

async function calculateSpendingByCategoryForUserId(userId) {
  // Use moment.js to get the exact current time and calculate 7 days back
  const now = moment().endOf('day'); // Consider up to the end of today
  const sevenDaysAgo = moment().subtract(6, 'days').startOf('day'); // Go back 6 days, start of that day

  console.log(`Calculating spending from ${sevenDaysAgo.toDate()} to ${now.toDate()}`);

  // Aggregate transactions by category within this time frame
  const transactions = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        transactionType: 'debit',
        createdAt: { $gte: sevenDaysAgo.toDate(), $lte: now.toDate() },
      },
    },
    {
      $group: {
        _id: '$transactionCategory',
        totalAmount: { $sum: '$transactionAmount' },
      },
    },
  ]);

  // Fetch all categories for this user, sorted alphabetically by title
  const categories = await Category.find({ user: userId }).sort('categoryTitle');

  // Prepare arrays for categories and their corresponding total spend
  let categoriesArray = [];
  let totalSpendArray = [];
  const transactionsMap = transactions.reduce(
    (acc, { _id, totalAmount }) => ({
      ...acc,
      [_id.toString()]: totalAmount,
    }),
    {},
  );

  categories.forEach(({ _id, categoryTitle }) => {
    categoriesArray.push(categoryTitle);
    totalSpendArray.push(transactionsMap[_id.toString()] || 0);
  });

  return { categories: categoriesArray, total_spend: totalSpendArray };
}

exports.spendByCategoryPastWeek = async (req, res) => {
  const userId = req.user._id;

  try {
    const { categories, total_spend } = await calculateSpendingByCategoryForUserId(userId);
    res.status(200).json({
      message: 'Spending by category analytics updated successfully.',
      categories,
      total_spend,
    });
  } catch (error) {
    console.error('Error calculating spending by category:', error);
    res.status(500).json({ error: 'Failed to calculate spending by category.' });
  }
};

