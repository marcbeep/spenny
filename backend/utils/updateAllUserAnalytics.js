const User = require('../models/userModel'); // Assuming you have a User model
const analyticsServices = require('../jobs/analyticsServices'); // Path to your refactored analytics services

async function updateAllUserAnalytics() {
  const users = await User.find({}); // Fetch all user IDs
  for (const user of users) {
    try {
      await analyticsServices.calculateTotalSpendForUserId(user._id);
      await analyticsServices.calculateSpendingByCategoryForUserId(user._id);
      await analyticsServices.calculateNetWorthForUserId(user._id);
      await analyticsServices.calculateIncomeVsExpensesForUserId(user._id);
      await analyticsServices.calculateSavingsRateForUserId(user._id);
      await analyticsServices.calculateAllTimeAnalyticsForUserId(user._id);
      console.log(`Analytics updated for user ${user._id}`);
    } catch (error) {
      console.error(`Error updating analytics for user ${user._id}:`, error);
    }
  }
}

module.exports = { updateAllUserAnalytics };
