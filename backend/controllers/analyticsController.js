const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Analytics = require('../models/analyticsModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');

const moment = require('moment');

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

// All time analytics

async function calculateAllTimeAnalyticsForUserId(userId) {
  try {
    const accounts = await Account.find({ user: userId });
    const netWorth = accounts.reduce((acc, account) => acc + account.accountBalance, 0);

    const transactionAggregation = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$transactionType',
          total: { $sum: '$transactionAmount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenditure = 0;
    transactionAggregation.forEach((group) => {
      if (group._id === 'credit') totalIncome = group.total;
      if (group._id === 'debit') totalExpenditure = group.total;
    });

    let savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenditure) / totalIncome) * 100 : 0;

    return {
      netWorth,
      totalIncome,
      totalExpenditure,
      savingsRate,
    };
  } catch (error) {
    console.error('Error calculating all-time analytics for user:', error);
    throw error;
  }
}

exports.allTimeAnalytics = async (req, res) => {
  const userId = req.user._id;

  try {
    const analyticsData = await calculateAllTimeAnalyticsForUserId(userId);

    await Analytics.findOneAndUpdate(
      { user: userId, analyticsType: 'allTime' },
      {
        $set: {
          analyticsData: analyticsData,
          analyticsLastCalculated: new Date(),
        },
      },
      { upsert: true },
    );

    res.status(200).json({
      message: 'All-time analytics calculated successfully.',
      data: analyticsData,
    });
  } catch (error) {
    console.error('Error calculating all-time analytics:', error);
    res.status(500).json({
      error: 'Failed to calculate all-time analytics.',
    });
  }
};
