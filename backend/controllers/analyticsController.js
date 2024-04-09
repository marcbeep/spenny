const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Analytics = require('../models/analyticsModel');
const Account = require('../models/accountModel');

const moment = require('moment');

function getCurrentWeekStartEnd() {
  const startOfWeek = moment().startOf('week').toDate();
  const endOfWeek = moment().endOf('week').toDate();
  return { startOfWeek, endOfWeek };
}

async function calculateTotalSpendForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();

  const transactions = await Transaction.find({
    user: userId,
    transactionType: 'debit',
    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
  });

  const totalSpend = transactions.reduce(
    (acc, transaction) => acc + transaction.transactionAmount,
    0,
  );

  const analytics = await Analytics.findOne({
    user: userId,
    analyticsType: 'totalSpend',
    periodStart: startOfWeek,
    periodEnd: endOfWeek,
  });

  if (analytics) {
    analytics.analyticsData = totalSpend;
    await analytics.save();
  } else {
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function calculateSpendingByCategoryForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();

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

  if (transactions.length === 0) {
    console.log('No transactions found for the specified period.');
    throw new Error('No spending transactions found for the current period.');
  }

  const analyticsData = transactions.map((transaction) => ({
    categoryId: transaction._id,
    totalAmount: transaction.totalAmount,
  }));

  let analytics = await Analytics.findOne({
    user: userId,
    analyticsType: 'spendingByCategory',
    periodStart: { $gte: startOfWeek },
    periodEnd: { $lte: endOfWeek },
  });

  if (analytics) {
    analytics.analyticsData = analyticsData;
    analytics.analyticsLastCalculated = new Date();
  } else {
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
  return analyticsData;
}

exports.calculateSpendingByCategory = async (req, res) => {
  const userId = req.user._id;

  try {
    const analyticsData = await calculateSpendingByCategoryForUserId(userId);
    res
      .status(200)
      .json({ message: 'Spending by category analytics updated successfully.', analyticsData });
  } catch (error) {
    console.error('Error calculating spending by category:', error);
    res.status(500).json({ error: 'Failed to calculate spending by category.' });
  }
};

async function calculateNetWorthForUserId(userId) {
  const accounts = await Account.find({ user: userId });
  const netWorth = accounts.reduce((acc, account) => acc + account.accountBalance, 0);

  await Analytics.findOneAndUpdate(
    { user: userId, analyticsType: 'netWorth' },
    {
      user: userId,
      analyticsType: 'netWorth',
      period: 'weekly',
      analyticsData: netWorth,
      analyticsLastCalculated: new Date(),
    },
    { upsert: true },
  );

  return netWorth;
}

exports.calculateNetWorth = async (req, res) => {
  const userId = req.user._id;

  try {
    const netWorth = await calculateNetWorthForUserId(userId);
    res.status(200).json({ message: 'Net worth calculated successfully.', netWorth });
  } catch (error) {
    console.error('Error calculating net worth:', error);
    res.status(500).json({ error: 'Failed to calculate net worth.' });
  }
};

async function calculateIncomeVsExpensesForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();
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

  let income = 0,
    expenses = 0;
  results.forEach((result) => {
    if (result._id === 'credit') {
      income = result.total;
    } else if (result._id === 'debit') {
      expenses = result.total;
    }
  });

  const analytics = await Analytics.findOneAndUpdate(
    { user: userId, analyticsType: 'incomeVsExpenses' },
    {
      user: userId,
      analyticsType: 'incomeVsExpenses',
      period: 'weekly',
      analyticsData: { income, expenses },
      analyticsLastCalculated: new Date(),
    },
    { upsert: true },
  );

  return { income, expenses };
}

exports.calculateIncomeVsExpenses = async (req, res) => {
  const userId = req.user._id;

  try {
    const { income, expenses } = await calculateIncomeVsExpensesForUserId(userId);
    res
      .status(200)
      .json({ message: 'Income vs. expenses calculated successfully.', income, expenses });
  } catch (error) {
    console.error('Error calculating income vs. expenses:', error);
    res.status(500).json({ error: 'Failed to calculate income vs. expenses.' });
  }
};

async function calculateSavingsRateForUserId(userId) {
  const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();
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

  let income = 0,
    expenses = 0;
  results.forEach((result) => {
    if (result._id === 'credit') {
      income += result.total;
    } else if (result._id === 'debit') {
      expenses += result.total;
    }
  });

  let savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  await Analytics.findOneAndUpdate(
    { user: userId, analyticsType: 'savingsRate' },
    {
      $set: {
        analyticsData: savingsRate,
        analyticsLastCalculated: new Date(),
        period: 'weekly',
        periodStart: startOfWeek,
        periodEnd: endOfWeek,
      },
    },
    { upsert: true },
  );

  return savingsRate;
}

exports.calculateSavingsRate = async (req, res) => {
  const userId = req.user._id;

  try {
    const savingsRate = await calculateSavingsRateForUserId(userId);
    res.status(200).json({ message: 'Savings rate calculated successfully.', savingsRate });
  } catch (error) {
    console.error('Error calculating savings rate:', error);
    res.status(500).json({ error: 'Failed to calculate savings rate.' });
  }
};

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

exports.calculateAllTimeAnalytics = async (req, res) => {
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
