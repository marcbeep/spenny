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
      case 'spending':
        // For 'spending', check if the current date is past the goal's reset day
        const today = moment();
        const resetDay = moment().isoWeekday(goal.goalResetDay); // Convert 'goalResetDay' to the correct moment weekday
        const resetDayPassed = today.isAfter(resetDay, 'day');

        if (resetDayPassed) {
          // If the reset day has passed, check if it's time to reset the goal status
          isFunded = false; // Assume underfunded if the reset day has passed
        } else {
          // Otherwise, check if the goal is currently funded
          isFunded = goal.goalTarget && goal.goalTarget <= goal.goalCategory.categoryAvailable;
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

