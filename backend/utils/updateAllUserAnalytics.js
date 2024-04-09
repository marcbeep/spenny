const User = require('../models/userModel');
const analyticsServices = require('../jobs/analyticsServices');

async function updateAllUserAnalytics() {
  try {
    const users = await User.find({});

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

    console.log('All user analytics updated successfully');
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

module.exports = { updateAllUserAnalytics };
