const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');
const moment = require('moment');

const checkAndUpdateGoalStatus = async (goalId = null) => {
  let query = goalId ? Goal.findOne({ _id: goalId }) : Goal.find();
  query = query.populate('goalCategory');

  const goals = await query;

  const processGoal = async (goal) => {
    let isFunded = false;

    switch (goal.goalType) {
      case 'saving':
      case 'minimumbalance':
        // For 'saving' and 'minimumbalance', compare against category's available funds
        isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
        break;
      case 'spending':
        // Convert 'goalResetDay' from string to moment's weekday number
        const goalResetDayNumber = moment().day(goal.goalResetDay).isoWeekday();
        const resetDayPassed = moment().isoWeekday() === goalResetDayNumber;
        isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable && !resetDayPassed;
        break;
      default:
        console.error(`Unknown goal type: ${goal.goalType}`);
    }

    goal.goalStatus = isFunded ? 'funded' : 'underfunded';

    // If the goal has a reset day and today is that day, reset goal for the next period
    if (goal.goalType === 'spending' && goal.goalResetDay && resetDayPassed) {
      goal.goalStatus = 'underfunded'; // Reset status for the new period
    }

    await goal.save();
  };

  if (Array.isArray(goals)) {
    for (let goal of goals) {
      await processGoal(goal);
    }
  } else if (goals) {
    // In case a single goal is found
    await processGoal(goals);
  }
};

module.exports = checkAndUpdateGoalStatus;
