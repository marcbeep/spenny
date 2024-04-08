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
        // For 'saving', compare against category's available funds
        isFunded = goal.goalTarget && goal.goalTarget <= goal.goalCategory.categoryAvailable;
        break;
      case 'minimumbalance':
        // For 'minimumbalance', no target is required, always consider it funded as long as there's some amount
        isFunded = goal.goalCategory.categoryAvailable > 0;
        break;
      case 'spending':
        // For 'spending', check if today matches the reset day. If it does, consider the possibility of resetting.
        const today = moment();
        const resetDay = moment().isoWeekday(goal.goalResetDay); // Convert 'goalResetDay' to the correct moment weekday
        const resetDayPassed = today.isoWeekday() >= resetDay.isoWeekday();

        isFunded = goal.goalTarget && goal.goalTarget <= goal.goalCategory.categoryAvailable && !resetDayPassed;
        
        // Reset goal status if today is the reset day and goal was funded
        if (resetDayPassed && today.isoWeekday() === resetDay.isoWeekday()) {
          goal.goalStatus = 'underfunded'; // Consider updating the logic for reset if necessary
        }
        break;
      default:
        console.error(`Unknown goal type: ${goal.goalType}`);
    }

    goal.goalStatus = isFunded ? 'funded' : 'underfunded';
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
