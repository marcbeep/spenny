/*
For each type of analytic, create corresponding functions in an analyticsController file. These functions will handle the logic for calculating, updating, and retrieving analytics data. Example functions might include:

calculateTotalSpend
calculateSpendingByCategory
calculateNetWorth
calculateIncomeVsExpenses
calculateSavingsRate

Each function will fetch relevant transaction and account data, perform calculations, and update the analytics document for the user.
*/

const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel'); 
const Analytics = require('../models/analyticsModel'); 

const moment = require('moment'); 

// Helper function to get the start and end of the current week
function getCurrentWeekStartEnd() {
  const startOfWeek = moment().startOf('week').toDate();
  const endOfWeek = moment().endOf('week').toDate();
  return { startOfWeek, endOfWeek };
}

exports.calculateTotalSpend = async (req, res) => {
    const userId = req.user._id;
    const { startOfWeek, endOfWeek } = getCurrentWeekStartEnd();

  try {
    // Fetch debit transactions for the user within the current week
    const transactions = await Transaction.find({
      user: userId,
      transactionType: 'debit', 
      createdAt: { $gte: startOfWeek, $lte: endOfWeek }
    });

    // Calculate total spend
    const totalSpend = transactions.reduce((acc, transaction) => acc + transaction.transactionAmount, 0);

    // Check if an analytics document for total spend this week already exists
    const analytics = await Analytics.findOne({
      user: userId,
      analyticsType: 'totalSpend',
      periodStart: startOfWeek,
      periodEnd: endOfWeek
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
        analyticsLastCalculated: new Date()
      });
    }

    res.status(200).json({ message: 'Total spend calculated successfully.', totalSpend: calculatedValue });
  } catch (error) {
    console.error('Error calculating total spend:', error);
  }
};
