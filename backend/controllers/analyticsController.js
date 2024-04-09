const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Analytics = require('../models/analyticsModel');
const Account = require('../models/accountModel');

const moment = require('moment');

// Helper function to get the start and end of the current week
function getCurrentWeekStartEnd() {
  const startOfWeek = moment().startOf('week').toDate();
  const endOfWeek = moment().endOf('week').toDate();
  return { startOfWeek, endOfWeek };
}

async function calculateTotalSpendForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();
  // Fetch debit transactions for the user within the current week
  const transactions = await Transaction.find({
    user: userId,
    transactionType: 'debit',
    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
  });

  // Calculate total spend
  const totalSpend = transactions.reduce(
    (acc, transaction) => acc + transaction.transactionAmount,
    0,
  );

  // Check if an analytics document for total spend this week already exists
  const analytics = await Analytics.findOne({
    user: userId,
    analyticsType: 'totalSpend',
    periodStart: startOfWeek,
    periodEnd: endOfWeek,
  });

  if (analytics) {
    // Update the existing document
    analytics.analyticsData = totalSpend;
    await analytics.save();
  } else {
    // Create a new analytics document
    await Analytics.create({
      user: userId,
      analyticsType: 'totalSpend',
      period: 'weekly',
      periodStart: startOfWeek,
      periodEnd: endOfWeek,
      analyticsData: totalSpend,
      analyticsLastCalculated: new Date(),
    });
  }

  return totalSpend;
}

exports.calculateTotalSpend = async (req, res) => {
  const userId = req.user._id;

  try {
    const totalSpend = await calculateTotalSpendForUserId(userId);
    res.status(200).json({ message: 'Total spend calculated successfully.', totalSpend });
  } catch (error) {
    console.error('Error calculating total spend:', error);
  }
};

async function calculateSpendingByCategoryForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();
  console.log('Aggregation Period:', startOfWeek, endOfWeek);
  console.log('Attempting to fetch transactions...');
  const transactions = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        transactionType: 'debit',
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $group: {
        _id: '$transactionCategory',
        totalAmount: { $sum: '$transactionAmount' },
      },
    },
  ]);

  console.log('Transactions fetched:', transactions.length);

  if (transactions.length === 0) {
    console.log('No transactions found for the specified period.');
    return res
      .status(404)
      .json({ message: 'No spending transactions found for the current period.' });
  }

  // Prepare analyticsData in the expected format
  const analyticsData = transactions.map((transaction) => ({
    categoryId: transaction._id,
    totalAmount: transaction.totalAmount,
  }));

  // Check if an analytics document for spending by category this week already exists
  let analytics = await Analytics.findOne({
    user: userId,
    analyticsType: 'spendingByCategory',
    periodStart: { $gte: startOfWeek },
    periodEnd: { $lte: endOfWeek },
  });

  if (analytics) {
    // Update the existing document
    console.log('Updating existing analytics document.');
    analytics.analyticsData = analyticsData;
    analytics.analyticsLastCalculated = new Date();
  } else {
    // Create a new analytics document
    console.log('Creating new analytics document.');
    analytics = new Analytics({
      user: userId,
      analyticsType: 'spendingByCategory',
      period: 'weekly',
      periodStart: startOfWeek,
      periodEnd: endOfWeek,
      analyticsData: analyticsData,
      analyticsLastCalculated: new Date(),
    });
  }

  await analytics.save();
  console.log('Analytics document saved successfully.');
  return analyticsData;
}

exports.calculateSpendingByCategory = async (req, res) => {
  console.log('Starting calculateSpendingByCategory...');
  const userId = req.user._id;
  console.log('UserID for aggregation:', userId);

  try {
    const analyticsData = await calculateSpendingByCategoryForUserId(userId);
    res
      .status(200)
      .json({ message: 'Spending by category analytics updated successfully.', analyticsData });
  } catch (error) {
    console.error('Error calculating spending by category:', error);
    res.status(500).json({
      error: 'Failed to calculate spending by category. Check server logs for more details.',
    });
  }
};

async function calculateNetWorthForUserId(userId) {
  console.log('Attempting to fetch accounts for net worth calculation...');
  // Fetch all accounts (both spending and tracking) for the user
  const accounts = await Account.find({ user: userId });

  // Calculate net worth as the sum of all account balances
  const netWorth = accounts.reduce((acc, account) => acc + account.accountBalance, 0);

  console.log('Net worth calculated:', netWorth);

  // Upsert the net worth analytics document for the user
  const analytics = await Analytics.findOneAndUpdate(
    { user: userId, analyticsType: 'netWorth' },
    {
      user: userId,
      analyticsType: 'netWorth',
      period: 'weekly', // Adjust according to how frequently you wish to calculate net worth
      analyticsData: netWorth, // Assuming analyticsData is structured to hold a numeric value
      analyticsLastCalculated: new Date(),
    },
    { new: true, upsert: true }, // This option creates the document if it doesn't exist
  );

  console.log('Net worth analytics document updated successfully.');
  return netWorth;
}

exports.calculateNetWorth = async (req, res) => {
  console.log('Starting calculateNetWorth...');
  const userId = req.user._id;
  console.log('UserID for net worth calculation:', userId);

  try {
    const netWorth = await calculateNetWorthForUserId(userId);
    res.status(200).json({ message: 'Net worth calculated successfully.', netWorth });
  } catch (error) {
    console.error('Error calculating net worth:', error);
    res
      .status(500)
      .json({ error: 'Failed to calculate net worth. Check server logs for more details.' });
  }
};

async function calculateIncomeVsExpensesForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();
  console.log('Calculation Period:', startOfWeek, endOfWeek);
  console.log('Attempting to fetch income and expenses transactions...');
  // Aggregate transactions to calculate total income and expenses
  const results = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $group: {
        _id: '$transactionType',
        total: { $sum: '$transactionAmount' },
      },
    },
  ]);

  console.log('Aggregation results:', results);

  // Initialize income and expenses to 0
  let income = 0,
    expenses = 0;
  results.forEach((result) => {
    if (result._id === 'credit') {
      income = result.total;
    } else if (result._id === 'debit') {
      expenses = result.total;
    }
  });

  console.log('Total Income:', income, 'Total Expenses:', expenses);

  // Upsert the income vs. expenses analytics document for the user
  const analytics = await Analytics.findOneAndUpdate(
    { user: userId, analyticsType: 'incomeVsExpenses' },
    {
      user: userId,
      analyticsType: 'incomeVsExpenses',
      period: 'weekly',
      analyticsData: { income, expenses },
      analyticsLastCalculated: new Date(),
    },
    { new: true, upsert: true },
  );

  console.log('Income vs. Expenses analytics document updated successfully.');
  return { income, expenses };
}

exports.calculateIncomeVsExpenses = async (req, res) => {
  console.log('Starting calculateIncomeVsExpenses...');
  const userId = req.user._id;
  console.log('UserID for income vs. expenses calculation:', userId);

  try {
    const { income, expenses } = await calculateIncomeVsExpensesForUserId(userId);
    res
      .status(200)
      .json({ message: 'Income vs. expenses calculated successfully.', income, expenses });
  } catch (error) {
    console.error('Error calculating income vs. expenses:', error);
    res.status(500).json({
      error: 'Failed to calculate income vs. expenses. Check server logs for more details.',
    });
  }
};

async function calculateSavingsRateForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();
  console.log('Calculation Period:', startOfWeek, endOfWeek);
  console.log('Attempting to fetch income and expenses transactions...');
  // Aggregate transactions to calculate total income and expenses
  const results = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $group: {
        _id: '$transactionType',
        total: { $sum: '$transactionAmount' },
      },
    },
  ]);

  // Initialize income and expenses to 0
  let income = 0,
    expenses = 0;
  results.forEach((result) => {
    if (result._id === 'credit') {
      income += result.total;
    } else if (result._id === 'debit') {
      expenses += result.total;
    }
  });

  // Calculate savings rate
  let savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  console.log('Savings Rate:', savingsRate);

  // Upsert the savings rate analytics document for the user
  await Analytics.findOneAndUpdate(
    { user: userId, analyticsType: 'savingsRate' },
    {
      $set: {
        analyticsData: savingsRate,
        analyticsLastCalculated: new Date(),
        // period, periodStart, and periodEnd could be adjusted based on your specific requirements
        period: 'weekly',
        periodStart: startOfWeek,
        periodEnd: endOfWeek,
      },
    },
    { new: true, upsert: true },
  );

  console.log('Savings rate analytics document updated successfully.');
  return savingsRate;
}

exports.calculateSavingsRate = async (req, res) => {
  console.log('Starting calculateSavingsRate...');
  const userId = req.user._id;
  console.log('UserID for savings rate calculation:', userId);

  try {
    const savingsRate = await calculateSavingsRateForUserId(userId);
    res.status(200).json({ message: 'Savings rate calculated successfully.', savingsRate });
  } catch (error) {
    console.error('Error calculating savings rate:', error);
    res
      .status(500)
      .json({ error: 'Failed to calculate savings rate. Check server logs for more details.' });
  }
};

async function calculateAllTimeAnalyticsForUserId(userId) {
  try {
    // All-time Net Worth
    const accounts = await Account.find({ user: userId });
    const netWorth = accounts.reduce((acc, account) => acc + account.accountBalance, 0);

    // All-time Total Income and Expenditure
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

    // All-time Savings Rate
    let savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenditure) / totalIncome) * 100 : 0;

    return {
      netWorth,
      totalIncome,
      totalExpenditure,
      savingsRate,
    };
  } catch (error) {
    console.error('Error calculating all-time analytics for user:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

exports.calculateAllTimeAnalytics = async (req, res) => {
  const userId = req.user._id;
  console.log('Starting calculateAllTimeAnalytics for userID:', userId);

  try {
    const analyticsData = await calculateAllTimeAnalyticsForUserId(userId);
    console.log('All-time analytics calculated successfully.');

    // Update or Create All-time Analytics Document
    await Analytics.findOneAndUpdate(
      { user: userId, analyticsType: 'allTime' },
      {
        $set: {
          analyticsData: analyticsData,
          analyticsLastCalculated: new Date(),
        },
      },
      { new: true, upsert: true },
    );

    res.status(200).json({
      message: 'All-time analytics calculated successfully.',
      data: analyticsData,
    });
  } catch (error) {
    console.error('Error calculating all-time analytics:', error);
    res.status(500).json({
      error: 'Failed to calculate all-time analytics. Check server logs for more details.',
    });
  }
};
